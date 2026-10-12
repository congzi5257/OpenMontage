import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

// Load Inter font for Latin text (numbers, model names)
const { fontFamily: interFont } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});
// Chinese text falls back to system Microsoft YaHei
const FONT_STACK = `'${interFont}', 'Microsoft YaHei', 'PingFang SC', sans-serif`;

// ─── Data from OpenRouter API (Artificial Analysis Intelligence Index) ─────
// Source: https://openrouter.ai/api/v1/models — ranked by intelligence_index
interface ModelEntry {
  rank: number;
  name: string;
  provider: string;
  score: number;
}

const MODELS: ModelEntry[] = [
  { rank: 1,  name: "Claude Opus 5",    provider: "Anthropic",   score: 60.7 },
  { rank: 2,  name: "Claude Fable 5",   provider: "Anthropic",   score: 59.9 },
  { rank: 3,  name: "GPT-5.6 Sol",      provider: "OpenAI",      score: 58.9 },
  { rank: 4,  name: "Kimi K3",          provider: "Moonshot AI", score: 57.1 },
  { rank: 5,  name: "Claude Opus 4.8",  provider: "Anthropic",   score: 55.7 },
  { rank: 6,  name: "GPT-5.6 Terra",    provider: "OpenAI",      score: 55.0 },
  { rank: 7,  name: "Grok 4.5",         provider: "xAI",         score: 53.8 },
  { rank: 8,  name: "Claude Sonnet 5",  provider: "Anthropic",   score: 53.4 },
  { rank: 9,  name: "Qwen3.8 Max",      provider: "Qwen",        score: 53.4 },
  { rank: 10, name: "GPT-5.6 Luna",     provider: "OpenAI",      score: 51.2 },
];

// ─── Timing ────────────────────────────────────────────────────────────────
const INTRO_FRAMES = 60;       // 2s title
const ENTRY_DURATION = 48;     // 1.6s per entry
const OUTRO_FRAMES = 60;       // 2s insight
const TOTAL_ENTRIES = 10;
// Total: 60 + 10*48 + 60 = 600 frames = 20s @ 30fps

// ─── Layout (1080 x 1920 vertical) ─────────────────────────────────────────
const WIDTH = 1080;
const HEADER_HEIGHT = 240;
const ENTRY_AREA_TOP = HEADER_HEIGHT + 20;   // 260
const ENTRY_AREA_BOTTOM = 1560;
const ENTRY_HEIGHT = (ENTRY_AREA_BOTTOM - ENTRY_AREA_TOP) / TOTAL_ENTRIES; // 130
const BAR_START_X = 115;
const BAR_MAX_WIDTH = 820;
const BAR_HEIGHT = 14;
const BAR_Y_OFFSET = 56;

// ─── Colors — 2 main: blue (#3B82F6) + gold (#FBBF24) ──────────────────────
const C = {
  bg: "#0B1120",
  primary: "#3B82F6",
  primaryLight: "#60A5FA",
  gold: "#FBBF24",
  text: "#E2E8F0",
  textDim: "#94A3B8",
  track: "#1E293B",
};

// ─── Bar scale — truncated 45..65 for visible differences ──────────────────
const SCORE_MIN = 45;
const SCORE_MAX = 65;

const normalizeScore = (s: number): number =>
  Math.max(0, Math.min(1, (s - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)));

// ════════════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════════════

export const LeaderboardRace: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Header animation ──
  const headerOpacity = interpolate(frame, [0, 12, 600], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headerScale = interpolate(
    frame,
    [0, 48, 62],
    [1.0, 1.0, 0.72],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Outro ──
  const outroStart = INTRO_FRAMES + TOTAL_ENTRIES * ENTRY_DURATION; // 540
  const outroOpacity = interpolate(
    frame,
    [outroStart, outroStart + 15, outroStart + 55, outroStart + 60],
    [0, 1, 1, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const outroY = interpolate(
    frame,
    [outroStart, outroStart + 15],
    [30, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );
  // Dim entries when outro appears
  const entriesDim = interpolate(
    frame,
    [outroStart - 8, outroStart + 20],
    [1, 0.35],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT_STACK }}>
      {/* Subtle radial glow for depth */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 25%, rgba(59,130,246,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ═══ Header ═══ */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: WIDTH,
          height: HEADER_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: headerOpacity,
          transformOrigin: "top center",
          transform: `scale(${headerScale})`,
        }}
      >
        <div style={{ fontSize: 54, fontWeight: 800, color: C.text, letterSpacing: 3, lineHeight: 1.15 }}>
          全球 Top 10
        </div>
        <div style={{ fontSize: 54, fontWeight: 800, color: C.primaryLight, letterSpacing: 3, lineHeight: 1.15 }}>
          大模型榜单
        </div>
        <div style={{ fontSize: 22, fontWeight: 400, color: C.textDim, marginTop: 14, letterSpacing: 1 }}>
          数据来源：OpenRouter · Intelligence Index
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          top: HEADER_HEIGHT,
          left: 80,
          width: WIDTH - 160,
          height: 1,
          backgroundColor: "rgba(59,130,246,0.15)",
          opacity: headerOpacity,
        }}
      />

      {/* ═══ Entries ═══ */}
      <div
        style={{
          position: "absolute",
          top: ENTRY_AREA_TOP,
          left: 0,
          width: WIDTH,
          height: ENTRY_AREA_BOTTOM - ENTRY_AREA_TOP,
          opacity: entriesDim,
        }}
      >
        {MODELS.map((model) => {
          // Reveal order: #10 first, #1 last (countdown build-up)
          const revealIndex = TOTAL_ENTRIES - model.rank;
          const entryStart = INTRO_FRAMES + revealIndex * ENTRY_DURATION;

          // Entry slide-in (smooth, no jumping)
          const slideSpring = spring({
            frame: frame - entryStart,
            fps,
            config: { damping: 18, stiffness: 120, mass: 1 },
          });
          const entryOpacity = interpolate(slideSpring, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const entryX = interpolate(slideSpring, [0, 1], [60, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Bar growth — starts 6 frames after entry appears
          const barStart = entryStart + 6;
          const barSpring = spring({
            frame: frame - barStart,
            fps,
            config: { damping: 14, stiffness: 80, mass: 1 },
          });
          const barProgress = interpolate(barSpring, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const targetWidth = normalizeScore(model.score) * BAR_MAX_WIDTH;
          const barWidth = barProgress * targetWidth;

          // Number counting animation
          const numProgress = interpolate(
            frame - barStart,
            [0, 28],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
          );
          const currentScore = model.score * numProgress;

          const y = (model.rank - 1) * ENTRY_HEIGHT;
          const isTop = model.rank === 1;
          const barColor = isTop ? C.gold : C.primary;
          const rankColor = isTop ? C.gold : C.primaryLight;
          const scoreColor = isTop ? C.gold : C.text;
          const barGlow = isTop ? "0 0 16px rgba(251,191,36,0.45)" : "none";

          return (
            <div
              key={model.rank}
              style={{
                position: "absolute",
                top: y,
                left: 0,
                width: WIDTH,
                height: ENTRY_HEIGHT,
                opacity: entryOpacity,
                transform: `translateX(${entryX}px)`,
              }}
            >
              {/* Rank number */}
              <div
                style={{
                  position: "absolute",
                  left: 45,
                  top: 2,
                  width: 55,
                  fontSize: 38,
                  fontWeight: 800,
                  color: rankColor,
                  textAlign: "right",
                }}
              >
                {model.rank}
              </div>

              {/* Model name + provider */}
              <div
                style={{
                  position: "absolute",
                  left: BAR_START_X,
                  top: 0,
                  fontSize: 27,
                  fontWeight: 700,
                  color: C.text,
                  whiteSpace: "nowrap",
                }}
              >
                {model.name}
                <span style={{ fontSize: 16, fontWeight: 400, color: C.textDim, marginLeft: 10 }}>
                  · {model.provider}
                </span>
              </div>

              {/* Bar track (faint background) */}
              <div
                style={{
                  position: "absolute",
                  left: BAR_START_X,
                  top: BAR_Y_OFFSET,
                  width: BAR_MAX_WIDTH,
                  height: BAR_HEIGHT,
                  backgroundColor: C.track,
                  borderRadius: BAR_HEIGHT / 2,
                }}
              />

              {/* Bar fill (animated) */}
              {barWidth > 0.5 && (
                <div
                  style={{
                    position: "absolute",
                    left: BAR_START_X,
                    top: BAR_Y_OFFSET,
                    width: barWidth,
                    height: BAR_HEIGHT,
                    backgroundColor: barColor,
                    borderRadius: BAR_HEIGHT / 2,
                    boxShadow: barGlow,
                  }}
                />
              )}

              {/* Score number — follows bar tip, counts up */}
              {numProgress > 0.01 && (
                <div
                  style={{
                    position: "absolute",
                    left: BAR_START_X + barWidth + 12,
                    top: BAR_Y_OFFSET - 9,
                    fontSize: 25,
                    fontWeight: 700,
                    color: scoreColor,
                  }}
                >
                  {currentScore.toFixed(1)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ Outro — insight ═══ */}
      <div
        style={{
          position: "absolute",
          top: 1620,
          left: 0,
          width: WIDTH,
          opacity: outroOpacity,
          transform: `translateY(${outroY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700, color: C.text, textAlign: "center" }}>
          Anthropic 占据 4 席
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, color: C.gold, marginTop: 12, textAlign: "center" }}>
          Claude Opus 5 以 60.7 分登顶
        </div>
        <div style={{ fontSize: 18, fontWeight: 400, color: C.textDim, marginTop: 18, textAlign: "center" }}>
          数据来源：OpenRouter · 2026.08
        </div>
      </div>
    </AbsoluteFill>
  );
};
