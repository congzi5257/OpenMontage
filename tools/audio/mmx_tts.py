"""MiniMax mmx-cli TTS provider tool.

Thin wrapper around the local mmx-cli binary
(`~/.workbuddy/binaries/node/versions/<ver>/mmx.cmd`). Inherits mmx-cli's
auth from `~/.mmx/config.json` (configured via `mmx auth login`), so this
tool needs no separate env var — only that `mmx` is on PATH and that the
user has run `mmx auth login` (or `mmx config set --key api_key --value ...`).

Supports all voices exposed by mmx-cli, including Chinese (Mandarin)_Gentleman.
Default model: speech-2.8-hd.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import time
from pathlib import Path
from typing import Any

from tools.base_tool import (
    BaseTool,
    Determinism,
    ExecutionMode,
    ResourceProfile,
    RetryPolicy,
    ToolResult,
    ToolRuntime,
    ToolStability,
    ToolStatus,
    ToolTier,
)


# mmx-cli ships as a Node.js shim at `~/.workbuddy/binaries/node/versions/<ver>/mmx.cmd`
# (already on PATH). We look it up by name first, then fall back to the known path.
MMX_BIN_NAME = "mmx"
MMX_FALLBACK = r"C:\Users\丛利\.workbuddy\binaries\node\versions\22.22.2\mmx.cmd"


class MMXTTS(BaseTool):
    name = "mmx_tts"
    version = "0.1.0"
    tier = ToolTier.VOICE
    capability = "tts"
    provider = "minimax"
    stability = ToolStability.PRODUCTION
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.STOCHASTIC
    runtime = ToolRuntime.API

    dependencies = []
    install_instructions = (
        "Local mmx-cli binary required (already on PATH in this workspace as `mmx`).\n"
        "Configure MiniMax credentials once: `mmx auth login --api-key <key>`\n"
        "or `mmx config set --key api_key --value <key>`.\n"
        "For MiniMax CN endpoint, also set base_url:\n"
        "  mmx config set --key base_url --value https://api.minimaxi.com\n"
        "  mmx config set --key region --value cn\n"
        "Test voices: `mmx speech voices` (lists all available voices).\n"
        "Default voice: Chinese (Mandarin)_Gentleman (温润男声)."
    )
    fallback = "piper_tts"
    fallback_tools = ["piper_tts", "openai_tts"]
    agent_skills = ["text-to-speech"]

    capabilities = [
        "text_to_speech",
        "voice_selection",
        "multilingual",
        "offline_friendly_when_cached",
    ]
    supports = {
        "voice_cloning": True,  # via mmx voice cloning if configured
        "multilingual": True,    # 100+ voices across many languages
        "offline": False,        # requires MiniMax API
        "native_audio": True,
    }
    best_for = [
        "Chinese narration with high quality (speech-2.8-hd model)",
        "Pre-curated voices across languages (English, Chinese, Korean, Japanese...)",
        "When OPENAI_API_KEY / ELEVENLABS_API_KEY are not available but MiniMax is",
    ]
    not_good_for = [
        "Strictly offline workflows (use piper_tts instead)",
    ]

    # ----- Tool contract fields -----
    resource_profile = ResourceProfile(
        cpu_cores=1, ram_mb=128, vram_mb=0, disk_mb=10, network_required=True,
    )
    retry_policy = RetryPolicy(max_retries=2, retryable_errors=[TimeoutError, ConnectionError])
    idempotency_key_fields = ["text", "voice", "model", "format"]
    side_effects = ["writes audio file to output_path", "calls MiniMax mmx API"]
    user_visible_verification = ["Listen to generated audio for tone and pacing"]

    # ----- Status / cost -----

    def get_status(self) -> ToolStatus:
        # mmx-cli must be on PATH (or at fallback path) AND ~/.mmx/config.json
        # must have an api_key (set by `mmx auth login`).
        if not self._find_binary():
            return ToolStatus.UNAVAILABLE
        cfg = Path.home() / ".mmx" / "config.json"
        if not cfg.exists():
            return ToolStatus.UNAVAILABLE
        try:
            data = json.loads(cfg.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return ToolStatus.UNAVAILABLE
        if data.get("api_key"):
            return ToolStatus.AVAILABLE
        return ToolStatus.UNAVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        # MiniMax speech pricing is bundled into user quota; we don't track per-char cost.
        # Return 0.0 to indicate cost is unknown / covered by subscription.
        return 0.0

    # ----- Execute -----

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        if self.get_status() != ToolStatus.AVAILABLE:
            return ToolResult(success=False, error="mmx-cli TTS not available. " + self.install_instructions)

        start = time.time()
        try:
            result = self._generate(inputs)
        except Exception as exc:
            return ToolResult(success=False, error=f"mmx-cli TTS failed: {exc}")

        result.duration_seconds = round(time.time() - start, 2)
        result.cost_usd = self.estimate_cost(inputs)
        return result

    # ----- Internals -----

    def _find_binary(self) -> str | None:
        """Locate the mmx binary — first on PATH, then in the workspace install."""
        found = shutil.which(MMX_BIN_NAME)
        if found:
            return found
        if Path(MMX_FALLBACK).exists():
            return MMX_FALLBACK
        return None

    def _generate(self, inputs: dict[str, Any]) -> ToolResult:
        text = inputs["text"]
        output_path = Path(inputs["output_path"])
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Defaults aligned with what worked end-to-end in gpu-explained-120s.
        # Override per-call via the inputs dict if needed.
        voice = inputs.get("voice", "Chinese (Mandarin)_Gentleman")
        model = inputs.get("model", "speech-2.8-hd")
        fmt = inputs.get("format", "wav")
        sample_rate = int(inputs.get("sample_rate", 22050))
        channels = int(inputs.get("channels", 1))

        cmd = [
            self._find_binary(),
            "speech", "synthesize",
            "--text", text,
            "--voice", voice,
            "--model", model,
            "--format", fmt,
            "--sample-rate", str(sample_rate),
            "--channels", str(channels),
            "--out", str(output_path),
            "--quiet",
            "--non-interactive",
        ]
        # Optional params
        if "speed" in inputs:
            cmd += ["--speed", str(inputs["speed"])]
        if "volume" in inputs:
            cmd += ["--volume", str(inputs["volume"])]
        if "pitch" in inputs:
            cmd += ["--pitch", str(inputs["pitch"])]

        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if proc.returncode != 0 or not output_path.exists():
            stderr = proc.stderr.strip() or proc.stdout.strip()
            return ToolResult(success=False, error=f"mmx-cli exit {proc.returncode}: {stderr[:500]}")

        # Probe duration via ffprobe (already on PATH in this workspace).
        size_bytes = output_path.stat().st_size
        duration_ms = self._probe_duration_ms(output_path)

        return ToolResult(
            success=True,
            data={
                "audio_path": str(output_path),
                "voice": voice,
                "model": model,
                "format": fmt,
                "sample_rate": sample_rate,
                "channels": channels,
                "size_bytes": size_bytes,
                "duration_ms": duration_ms,
            },
        )

    @staticmethod
    def _probe_duration_ms(audio_path: Path) -> int | None:
        try:
            proc = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path)],
                capture_output=True, text=True, timeout=10, check=True,
            )
            return int(float(proc.stdout.strip()) * 1000)
        except Exception:
            return None