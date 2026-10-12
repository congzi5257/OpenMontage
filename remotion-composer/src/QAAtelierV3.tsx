import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";
import { loadFont as loadJet } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: notoSC } = loadFont("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin"],
});
const { fontFamily: jetMono } = loadJet("normal", {
  weights: ["700"],
  subsets: ["latin"],
});
const FONT_TITLE = `'${notoSC}', 'Microsoft YaHei', sans-serif`;
const FONT_NUM = `'${jetMono}', monospace`;

const resolveAsset = (src: string): string =>
  src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")
    ? src
    : staticFile(src);

const COLORS = {
  orange: "#E07A3F",
  brown: "#3A3226",
  cream: "#FAF7F2",
  dark: "#1A1F2E",
  gray: "#8A7E6D",
  white: "#FFFFFF",
};

const DING_AT_MS = [200, 9300, 15900, 49800, 55000]; // hook/end-of-hook/empathy/end-of-solution/end-of-cta

// ═══════════════════════════════════════════════════════════════════════════
// IP-FIXED visual elements — these MUST appear in every QA video
// ═══════════════════════════════════════════════════════════════════════════

// Watermark: 职场问答 60s logo bottom-right
const Watermark: React.FC<{ atFrame: number; fps: number }> = ({ atFrame, fps }) => {
  const f = useCurrentFrame();
  const appearsAt = atFrame;
  const heldFrames = 60; // 2s
  const t = f - appearsAt;
  const opacity = interpolate(t, [0, 8, heldFrames - 8, heldFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (t < 0 || t > heldFrames) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 36,
        right: 36,
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: COLORS.orange,
          color: COLORS.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_NUM,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        60s
      </div>
      <div
        style={{
          fontFamily: FONT_TITLE,
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.cream,
          textShadow: "0 2px 6px rgba(0,0,0,0.4)",
        }}
      >
        职场问答
      </div>
    </div>
  );
};

// Numbered circle ① ② ③ — used in solution step
const NumberCircle: React.FC<{ num: number; size?: number }> = ({ num, size = 90 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: COLORS.orange,
      color: COLORS.white,
      fontFamily: FONT_TITLE,
      fontSize: size * 0.5,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 6px 20px rgba(224,122,63,0.45)",
      flexShrink: 0,
    }}
  >
    {num}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// ACT 1 — Hook (kinetic-type-beats escalation + giant question mark)
// ═══════════════════════════════════════════════════════════════════════════
const HookAct: React.FC<{
  startFrame: number;
  hookLine: string;
  hookWord: string;
  hookIcon?: string;
}> = ({ startFrame, hookLine, hookWord, hookIcon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0) return null;

  // Phase 1 (0-0.7s): giant question mark explodes from center
  const markScale = spring({ frame: local, fps, config: { damping: 12, stiffness: 240, mass: 0.6 } });
  const markRotation = interpolate(local, [0, 18], [-90, 0], {
    extrapolateRight: "clamp",
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
  });

  // Phase 2 (0.7-1.4s): background counter/dial pulses
  const pulseT = (local / fps) % 1;

  // Phase 3 (1.4-3.5s): hook line types out char by char
  const charsShown = Math.min(
    hookLine.length,
    Math.floor(interpolate(local, [42, 42 + hookLine.length * 4], [0, hookLine.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }))
  );

  // Phase 4: focus word pops
  const focusStart = 42 + hookLine.length * 4 + 12;
  const focusScale = spring({ frame: local - focusStart, fps, config: { damping: 14, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ background: COLORS.dark, overflow: "hidden" }}>
      {/* IP background "?" watermark faint */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          fontSize: 380,
          fontFamily: FONT_TITLE,
          fontWeight: 800,
          color: "rgba(224,122,63,0.08)",
          transform: "rotate(12deg)",
        }}
      >
        ?
      </div>

      {/* Optional hook icon — central visual that varies per video */}
      {hookIcon && (
        <div
          style={{
            position: "absolute",
            top: "14%",
            left: 0,
            width: 108,
            textAlign: "center",
            fontSize: 200,
            opacity: interpolate(local, [12, 24], [0, 1], { extrapolateLeft: "clamp" }),
            transform: `translateY(${interpolate(local, [12, 36], [40, 0])}px)`,
          }}
        >
          {hookIcon}
        </div>
      )}

      {/* Giant question mark (signature) */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: 0,
          width: 108,
          textAlign: "center",
          fontSize: 360,
          fontFamily: FONT_TITLE,
          fontWeight: 800,
          color: COLORS.orange,
          textShadow: "0 0 60px rgba(224,122,63,0.55), 0 8px 0 #000",
          WebkitTextStroke: "6px white",
          transform: `scale(${markScale}) rotate(${markRotation}deg)`,
        }}
      >
        ?
      </div>

      {/* Hook line (typed) */}
      <div
        style={{
          position: "absolute",
          bottom: "28%",
          left: 60,
          right: 60,
          fontSize: 56,
          fontFamily: FONT_TITLE,
          fontWeight: 800,
          color: COLORS.cream,
          lineHeight: 1.45,
          textAlign: "center",
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        {hookLine.slice(0, charsShown)}
        {charsShown < hookLine.length && (
          <span
            style={{
              display: "inline-block",
              width: 4,
              height: 56,
              background: COLORS.orange,
              marginLeft: 4,
              verticalAlign: "middle",
              opacity: Math.sin(local * 0.6) > 0 ? 1 : 0,
            }}
          />
        )}
      </div>

      {/* Focus word emphasis */}
      {focusStart > 0 && local >= focusStart && (
        <div
          style={{
            position: "absolute",
            bottom: "16%",
            left: 0,
            width: 108,
            textAlign: "center",
            transform: `scale(${focusScale})`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: COLORS.orange,
              color: COLORS.white,
              fontFamily: FONT_TITLE,
              fontSize: 48,
              fontWeight: 800,
              padding: "14px 36px",
              borderRadius: 16,
              boxShadow: "0 8px 28px rgba(224,122,63,0.5)",
            }}
          >
            {hookWord}
          </div>
        </div>
      )}

      {/* Subtle pulsing ring on background for life */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          marginLeft: -300,
          marginTop: -300,
          borderRadius: 300,
          border: `2px solid rgba(224,122,63,${0.15 + 0.1 * Math.sin(pulseT * Math.PI * 2)})`,
          transform: `scale(${1 + pulseT * 0.15})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ACT 2 — Empathy (kinetic-type fixed-line token swap)
// ═══════════════════════════════════════════════════════════════════════════
const EmpathyAct: React.FC<{
  startFrame: number;
  fullLine: string;
  replaceWord: string;
  replaceWith: string;
}> = ({ startFrame, fullLine, replaceWord, replaceWith }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0) return null;

  // Phase 1 (0-0.4s): cream background fades in
  // Phase 2 (0.4-1.6s): fullLine types in
  const fullShown = Math.min(
    fullLine.length,
    Math.floor(interpolate(local, [12, 12 + fullLine.length * 3], [0, fullLine.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }))
  );

  // Phase 3 (1.6-2.4s): the word "swaps" — backspace out the replaceWord and type replaceWith
  const swapStart = 12 + fullLine.length * 3 + 6;
  const swapProgress = interpolate(local, [swapStart, swapStart + 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shownCharsInReplaceWord = Math.floor(swapProgress * replaceWord.length);
  const finalLineShown =
    fullLine.slice(0, fullLine.indexOf(replaceWord)) +
    replaceWord.slice(0, shownCharsInReplaceWord) +
    fullLine.slice(fullLine.indexOf(replaceWord) + replaceWord.length);

  // Final replace word scales in after swap completes
  const replaceScale = spring({
    frame: local - (swapStart + 36),
    fps,
    config: { damping: 14, stiffness: 200 },
  });

  // Render with the replace word highlighted
  const parts = finalLineShown.split(replaceWord);
  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      {/* Top half — empathy label */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 60,
          fontSize: 32,
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          color: COLORS.orange,
          letterSpacing: 4,
        }}
      >
        → 你不是一个人
      </div>

      {/* Main quote — fixed-line with replaceWord highlight */}
      <div
        style={{
          position: "absolute",
          top: "26%",
          left: 60,
          right: 60,
          fontSize: 62,
          fontFamily: FONT_TITLE,
          fontWeight: 800,
          color: COLORS.brown,
          lineHeight: 1.4,
        }}
      >
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            {p}
            {i < parts.length - 1 && (
              <span
                style={{
                  color: COLORS.orange,
                  background: "rgba(224,122,63,0.18)",
                  padding: "2px 8px",
                  borderRadius: 8,
                  display: "inline-block",
                  transform: `scale(${i === 0 ? 1 : replaceScale})`,
                  transformOrigin: "center",
                }}
              >
                {replaceWord}
              </span>
            )}
          </React.Fragment>
        ))}
        {fullShown < fullLine.length && swapStart > local && (
          <span
            style={{
              display: "inline-block",
              width: 4,
              height: 60,
              background: COLORS.orange,
              marginLeft: 4,
              verticalAlign: "middle",
              opacity: Math.sin(local * 0.5) > 0 ? 1 : 0,
            }}
          />
        )}
      </div>

      {/* Sub line */}
      <div
        style={{
          position: "absolute",
          bottom: 240,
          left: 60,
          right: 60,
          fontSize: 32,
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          color: COLORS.gray,
          lineHeight: 1.5,
          opacity: interpolate(local, [swapStart + 50, swapStart + 70], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        几乎每个职场人都这样，不用自责。
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ACT 3 — Solution (grid-card-assemble: 3 numbered steps cascade in)
// ═══════════════════════════════════════════════════════════════════════════
const SolutionAct: React.FC<{
  startFrame: number;
  steps: { title: string; detail: string }[];
}> = ({ startFrame, steps }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0) return null;

  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          right: 60,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: interpolate(local, [0, 10], [0, 1], { extrapolateLeft: "clamp" }),
        }}
      >
        <div
          style={{
            width: 56,
            height: 4,
            background: COLORS.orange,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 36,
            fontFamily: FONT_TITLE,
            fontWeight: 800,
            color: COLORS.brown,
            letterSpacing: 3,
          }}
        >
          记住三步
        </div>
      </div>

      {/* 3 step cards */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 60,
          right: 60,
          bottom: 200,
          display: "flex",
          flexDirection: "column",
          gap: 36,
        }}
      >
        {steps.map((step, i) => {
          const delay = i * 18; // staggered cascade
          const sSpring = spring({
            frame: local - delay,
            fps,
            config: { damping: 16, stiffness: 140, mass: 0.9 },
          });
          const sOpacity = interpolate(sSpring, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
          });
          const sX = interpolate(sSpring, [0, 1], [60, 0], {
            extrapolateLeft: "clamp",
          });
          const cardShown = sSpring >= 0.05;
          return (
            <div
              key={i}
              style={{
                opacity: sOpacity,
                transform: `translateX(${sX}px)`,
                display: "flex",
                alignItems: "center",
                gap: 28,
                background: COLORS.white,
                padding: "32px 36px",
                borderRadius: 24,
                boxShadow: "0 8px 24px rgba(58,50,38,0.08)",
                minHeight: 180,
              }}
            >
              <NumberCircle num={i + 1} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 42,
                    fontFamily: FONT_TITLE,
                    fontWeight: 800,
                    color: COLORS.brown,
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontFamily: FONT_TITLE,
                    fontWeight: 700,
                    color: COLORS.gray,
                    marginTop: 10,
                    lineHeight: 1.5,
                    opacity: cardShown ? 1 : 0,
                  }}
                >
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ACT 4 — CTA (cta-morph-press: brand mark → CTA → press)
// ═══════════════════════════════════════════════════════════════════════════
const CTAAct: React.FC<{
  startFrame: number;
  ctaLine: string;
}> = ({ startFrame, ctaLine }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0) return null;

  // Phase 1 (0-0.6s): brand mark holds + breathes
  const breatheRotation = Math.sin(local * 0.05) * 2;
  // Phase 2 (0.6-1.4s): mark CONDENSES into CTA pill
  const morphProgress = spring({
    frame: local - 18,
    fps,
    config: { damping: 16, stiffness: 120 },
  });
  const markOpacity = interpolate(morphProgress, [0, 0.5], [1, 0], {
    extrapolateRight: "clamp",
  });
  const markScale = interpolate(morphProgress, [0, 1], [1, 0.6], {
    extrapolateRight: "clamp",
  });
  // Phase 3 (1.4-3.0s): cursor approaches
  // Phase 4 (3.0-3.6s): press — CTA squishes, ripple
  const pressWindow = local > 90 && local < 108;
  const pressAmount = pressWindow ? interpolate(local, [90, 96, 108], [0, 1, 0], {
    extrapolateRight: "clamp",
  }) : 0;

  const ctaSpring = spring({
    frame: local - 18,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  return (
    <AbsoluteFill style={{ background: COLORS.orange, overflow: "hidden" }}>
      {/* Brand mark (Phase 1) */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: 0,
          width: 108,
          textAlign: "center",
          fontFamily: FONT_TITLE,
          fontWeight: 800,
          opacity: markOpacity,
          transform: `rotate(${breatheRotation}deg) scale(${markScale})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: COLORS.white,
            color: COLORS.orange,
            padding: "16px 36px",
            borderRadius: 18,
            fontSize: 36,
            letterSpacing: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          职场问答 60s
        </div>
      </div>

      {/* CTA pill (Phase 2+) */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: 0,
          width: 108,
          textAlign: "center",
          transform: `scale(${ctaSpring * (1 - pressAmount * 0.08)}) translateY(${pressAmount * 4}px)`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: COLORS.brown,
            color: COLORS.white,
            padding: "30px 56px",
            borderRadius: 22,
            fontFamily: FONT_TITLE,
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: 4,
            boxShadow: `0 ${12 - pressAmount * 4}px ${36 - pressAmount * 12}px rgba(0,0,0,${0.3 - pressAmount * 0.15})`,
          }}
        >
          {ctaLine}
        </div>
      </div>

      {/* Cursor approach + click */}
      {local >= 70 && local <= 130 && (
        <div
          style={{
            position: "absolute",
            top: "32%",
            left: interpolate(local, [70, 90], [100, 540], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: (t: number) => 1 - Math.pow(1 - t, 3),
            }),
            fontSize: 56,
            transform: "rotate(-15deg)",
            opacity: local < 92 ? 1 : Math.max(0, 1 - (local - 92) / 8),
          }}
        >
          👆
        </div>
      )}

      {/* Press ripple */}
      {pressWindow && (
        <div
          style={{
            position: "absolute",
            top: "44%",
            left: 0,
            width: 108,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "inline-block",
              width: 320,
              height: 100,
              borderRadius: 50,
              border: "4px solid rgba(255,255,255,0.7)",
              opacity: interpolate(local, [96, 108], [0.8, 0], {
                extrapolateRight: "clamp",
              }),
              transform: `scale(${interpolate(local, [96, 108], [1, 1.5], { extrapolateRight: "clamp" })})`,
            }}
          />
        </div>
      )}

      {/* Bottom CTA line */}
      <div
        style={{
          position: "absolute",
          bottom: 260,
          left: 60,
          right: 60,
          textAlign: "center",
          fontSize: 32,
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          color: COLORS.white,
          opacity: interpolate(local, [120, 140], [0, 1], { extrapolateLeft: "clamp" }),
        }}
      >
        关注职场问答 60s
        <br />
        下条更狠
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Caption overlay (small, bottom-anchored, white pill)
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// Main composition
// ═══════════════════════════════════════════════════════════════════════════

export interface QAV3Props {
  hookStart: number;        // seconds
  hookEnd: number;
  hookLine: string;
  hookWord: string;         // emphasis pill
  hookIcon?: string;        // emoji or short text per video
  empathyStart: number;
  empathyEnd: number;
  empathyLine: string;
  empathyReplace: string;   // word to highlight/replace
  solutionStart: number;
  steps: { title: string; detail: string }[];
  ctaStart: number;
  ctaLine: string;
  narrationSrc: string;
  musicSrc: string;
}

export const QAAtelierV3: React.FC<QAV3Props> = (props) => {
  const { fps, durationInFrames } = useVideoConfig();

  const toF = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill style={{ background: COLORS.dark, fontFamily: FONT_TITLE }}>
      {/* ACT 1: Hook */}
      <Sequence from={toF(props.hookStart)} durationInFrames={toF(props.hookEnd - props.hookStart)}>
        <HookAct
          startFrame={0}
          hookLine={props.hookLine}
          hookWord={props.hookWord}
          hookIcon={props.hookIcon}
        />
      </Sequence>

      {/* ACT 2: Empathy */}
      <Sequence from={toF(props.empathyStart)} durationInFrames={toF(props.empathyEnd - props.empathyStart)}>
        <EmpathyAct
          startFrame={0}
          fullLine={props.empathyLine}
          replaceWord={props.empathyReplace}
          replaceWith={props.empathyReplace}
        />
      </Sequence>

      {/* ACT 3: Solution */}
      <Sequence from={toF(props.solutionStart)} durationInFrames={toF(durationInFrames / fps - props.solutionStart - (durationInFrames / fps - props.ctaStart))}>
        <SolutionAct startFrame={0} steps={props.steps} />
      </Sequence>

      {/* ACT 4: CTA */}
      <Sequence from={toF(props.ctaStart)} durationInFrames={toF(durationInFrames / fps - props.ctaStart)}>
        <CTAAct startFrame={0} ctaLine={props.ctaLine} />
      </Sequence>

      {/* Watermark during hook + cta */}
      <Watermark atFrame={toF(0.5)} fps={fps} />
      <Watermark atFrame={toF(props.ctaStart + 5.5)} fps={fps} />

      {/* Ding SFX at signature beats */}
      {DING_AT_MS.map((ms, i) => (
        <Sequence key={i} from={toF(ms / 1000) - 1} durationInFrames={toF(0.5)}>
          <Audio src={resolveAsset("qa-workplace/ding.wav")} volume={0.5} />
        </Sequence>
      ))}

      {/* Background music */}
      <Audio
        src={resolveAsset(props.musicSrc)}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, 30], [0, 0.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const fadeOut = interpolate(f, [durationInFrames - 40, durationInFrames], [fadeIn, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return Math.max(0, fadeOut);
        }}
      />

      {/* Narration */}
      <Audio src={resolveAsset(props.narrationSrc)} volume={1} />
    </AbsoluteFill>
  );
};