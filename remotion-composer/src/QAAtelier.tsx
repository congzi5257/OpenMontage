import React from "react";
import {
  AbsoluteFill,
  Img,
  Audio,
  Sequence,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { CaptionOverlay, WordCaption } from "./components/CaptionOverlay";

// Resolve asset path for both <Img> and <Audio> — CLI renderer uses HTTP server,
// so relative paths must be wrapped in staticFile() to map to public/.
const resolveAsset = (src: string): string => {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  return staticFile(src);
};

// ═══════════════════════════════════════════════════════════════════════════
// QAAtelier — hand-authored Q&A short video composition (9:16 vertical)
// Visual language: photographic scene backgrounds with slow Ken Burns motion,
// warm cards for key lines, word-level captions, narration + music.
// ═══════════════════════════════════════════════════════════════════════════

export interface QAScene {
  id: string;
  image: string;             // public/ relative path
  startMs: number;
  endMs: number;
  kenBurns?: "zoom-in" | "zoom-out" | "pan-right" | "pan-left";
  darken?: number;           // 0..1 overlay darkness for readability
}

export type CardKind = "question" | "quote" | "steps" | "big-text";

export interface QACard {
  id: string;
  kind: CardKind;
  startMs: number;
  endMs: number;
  text?: string;             // for question/quote/big-text (supports \n)
  steps?: { title: string; detail: string }[];  // for steps
}

export interface QAProps {
  scenes: QAScene[];
  cards: QACard[];
  captions: WordCaption[];
  narrationSrc: string;
  musicSrc?: string;
  musicOffsetSeconds?: number;
  musicVolume?: number;
  // theme
  backgroundColor: string;
  cardColor: string;
  cardBorderColor: string;
  textColor: string;
  accentColor: string;
  mutedColor: string;
  captionHighlightColor: string;
  captionBackgroundColor: string;
  captionFontSize: number;
}

// ─── Ken Burns background with cross-fade ───────────────────────────────────
const KenBurns: React.FC<{ scene: QAScene; fps: number; durationInFrames: number }> = ({
  scene,
  fps,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const dur = Math.max(durationInFrames, 1);
  const p = frame / dur;

  let scale = 1.1;
  let x = 0;
  let y = 0;
  if (scene.kenBurns === "zoom-in") {
    scale = interpolate(p, [0, 1], [1.0, 1.14], { extrapolateRight: "clamp" });
  } else if (scene.kenBurns === "zoom-out") {
    scale = interpolate(p, [0, 1], [1.14, 1.0], { extrapolateRight: "clamp" });
  } else if (scene.kenBurns === "pan-right") {
    scale = 1.12;
    x = interpolate(p, [0, 1], [-2, 2], { extrapolateRight: "clamp" });
  } else if (scene.kenBurns === "pan-left") {
    scale = 1.12;
    x = interpolate(p, [0, 1], [2, -2], { extrapolateRight: "clamp" });
  }

  const darken = scene.darken ?? 0.55;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${x}%, ${y}%)`,
          transformOrigin: "center",
        }}
      >
        <Img
          src={resolveAsset(scene.image)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(10, 12, 16, ${darken})` }} />
    </AbsoluteFill>
  );
};

// ─── Card renderers ─────────────────────────────────────────────────────────
const CardEntrance: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 110 },
  });
  return (
    <div
      style={{
        opacity: interpolate(s, [0, 1], [0, 1], { extrapolateLeft: "clamp" }),
        transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px) scale(${interpolate(
          s,
          [0, 1],
          [0.96, 1]
        )})`,
      }}
    >
      {children}
    </div>
  );
};

const QuestionCard: React.FC<{ card: QACard; theme: QAProps }> = ({ card, theme }) => {
  const lines = (card.text ?? "").split("\n");
  return (
    <CardEntrance>
      <div
        style={{
          background: theme.cardColor,
          borderLeft: `8px solid ${theme.accentColor}`,
          borderRadius: 20,
          padding: "40px 44px",
          maxWidth: "82%",
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 600, color: theme.accentColor, marginBottom: 14 }}>
          「 职场问答 」
        </div>
        {lines.map((ln, i) => (
          <div
            key={i}
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: theme.textColor,
              lineHeight: 1.35,
              fontFamily: "Microsoft YaHei, sans-serif",
            }}
          >
            {ln}
          </div>
        ))}
      </div>
    </CardEntrance>
  );
};

const QuoteCard: React.FC<{ card: QACard; theme: QAProps }> = ({ card, theme }) => {
  const lines = (card.text ?? "").split("\n");
  return (
    <CardEntrance>
      <div
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          borderRadius: 20,
          padding: "34px 40px",
          maxWidth: "82%",
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: 40, color: theme.accentColor, lineHeight: 0.6 }}>“</div>
        {lines.map((ln, i) => (
          <div
            key={i}
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: theme.textColor,
              lineHeight: 1.5,
              fontFamily: "Microsoft YaHei, sans-serif",
            }}
          >
            {ln}
          </div>
        ))}
      </div>
    </CardEntrance>
  );
};

const StepsCard: React.FC<{ card: QACard; theme: QAProps }> = ({ card, theme }) => {
  const steps = card.steps ?? [];
  return (
    <CardEntrance>
      <div
        style={{
          background: theme.cardColor,
          borderRadius: 24,
          padding: "44px 48px",
          width: "86%",
          boxShadow: "0 14px 44px rgba(0,0,0,0.22)",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, color: theme.accentColor, marginBottom: 26 }}>
          记住三步
        </div>
        {steps.map((step, i) => {
          const f = useCurrentFrame();
          const { fps } = useVideoConfig();
          const s = spring({
            frame: f - i * 6,
            fps,
            config: { damping: 18, stiffness: 120 },
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: 22,
                opacity: interpolate(s, [0, 1], [0, 1], { extrapolateLeft: "clamp" }),
                transform: `translateX(${interpolate(s, [0, 1], [30, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  background: theme.accentColor,
                  color: "#FFFFFF",
                  fontSize: 28,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginRight: 22,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ fontSize: 34, fontWeight: 700, color: theme.textColor, lineHeight: 1.3 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 26, fontWeight: 400, color: theme.mutedColor, marginTop: 6, lineHeight: 1.5 }}>
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardEntrance>
  );
};

const BigTextCard: React.FC<{ card: QACard; theme: QAProps }> = ({ card, theme }) => {
  const lines = (card.text ?? "").split("\n");
  return (
    <CardEntrance delay={4}>
      <div style={{ maxWidth: "86%", textAlign: "center" }}>
        {lines.map((ln, i) => (
          <div
            key={i}
            style={{
              fontSize: 46,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.4,
              fontFamily: "Microsoft YaHei, sans-serif",
              textShadow: "0 3px 16px rgba(0,0,0,0.6)",
            }}
          >
            {ln}
          </div>
        ))}
      </div>
    </CardEntrance>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Main composition
// ═══════════════════════════════════════════════════════════════════════════

export const QAAtelier: React.FC<QAProps> = (props) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Music fade-in/out
  const musicVolume =
    props.musicSrc === undefined
      ? undefined
      : (f: number) => {
          const fadeIn = interpolate(f, [0, 12], [0, props.musicVolume ?? 0.18], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(f, [durationInFrames - 20, durationInFrames], [fadeIn, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return Math.max(0, Math.min(1, fadeOut));
        };

  return (
    <AbsoluteFill style={{ backgroundColor: props.backgroundColor }}>
      {/* Layer 1: scene backgrounds with cross-fade */}
      {props.scenes.map((scene, i) => {
        const from = Math.round((scene.startMs / 1000) * fps);
        const duration = Math.round(((scene.endMs - scene.startMs) / 1000) * fps);
        const next = props.scenes[i + 1];
        // cross-fade tail into next scene
        const xfade = next
          ? Math.min(10, Math.round(((next.startMs - scene.endMs) / 1000) * fps) + 10)
          : 0;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration + xfade} name={scene.id}>
            <CrossFade scene={scene} fps={fps} durationInFrames={duration + xfade} />
          </Sequence>
        );
      })}

      {/* Layer 2: cards */}
      {props.cards.map((card) => {
        const from = Math.round((card.startMs / 1000) * fps);
        const duration = Math.max(1, Math.round(((card.endMs - card.startMs) / 1000) * fps));
        return (
          <Sequence key={card.id} from={from} durationInFrames={duration} name={card.id}>
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160 }}>
              {card.kind === "question" && <QuestionCard card={card} theme={props} />}
              {card.kind === "quote" && <QuoteCard card={card} theme={props} />}
              {card.kind === "steps" && <StepsCard card={card} theme={props} />}
              {card.kind === "big-text" && <BigTextCard card={card} theme={props} />}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Layer 3: word captions — one line at a time */}
      {props.captions.length > 0 && (
        <CaptionOverlay
          words={props.captions}
          wordsPerPage={1}
          fontSize={props.captionFontSize}
          color="#3A3226"
          highlightColor={props.captionHighlightColor}
          backgroundColor={props.captionBackgroundColor}
          fontFamily="Microsoft YaHei, sans-serif"
        />
      )}

      {/* Layer 4: audio */}
      {props.narrationSrc && (
        <Audio src={resolveAsset(props.narrationSrc)} volume={1} />
      )}
      {props.musicSrc && (
        <Audio
          src={resolveAsset(props.musicSrc)}
          startFrom={Math.round((props.musicOffsetSeconds ?? 0) * fps)}
          volume={musicVolume}
        />
      )}
    </AbsoluteFill>
  );
};

// Cross-fade wrapper: keeps the image slightly animated and fades out at the tail
const CrossFade: React.FC<{ scene: QAScene; fps: number; durationInFrames: number }> = (p) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = p;
  // fade out during last 10 frames
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <KenBurns {...p} />
    </AbsoluteFill>
  );
};
