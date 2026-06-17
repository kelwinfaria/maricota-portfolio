import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ProductSlide } from "../components/ProductSlide";
import { produtos } from "../data/produtos";

const SLIDE_DURATION = 75; // ~2.5s por produto a 30fps
const TRANSITION = 15;     // 0.5s de transição
const INTRO_DURATION = 45; // 1.5s de intro
const OUTRO_DURATION = 45; // 1.5s de outro

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 18 } });
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #f5ede3 0%, #e8d5c4 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ transform: `scale(${scale})`, opacity }}>
        <Img
          src={staticFile("images/logo-maricota.png")}
          style={{ width: 280, objectFit: "contain" }}
        />
      </div>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "32px",
          color: "#8b6e5a",
          marginTop: 24,
          letterSpacing: "4px",
          textTransform: "uppercase",
          opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Novidades da Coleção
      </p>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #f5ede3 0%, #e8d5c4 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        opacity,
      }}
    >
      <Img
        src={staticFile("images/logo-maricota.png")}
        style={{ width: 220, objectFit: "contain", marginBottom: 32 }}
      />
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "48px",
        color: "#6b4f3a",
        textAlign: "center",
        lineHeight: 1.3,
      }}>
        Peças feitas com{"\n"}amor ✨
      </p>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "28px",
        color: "#c9956e",
        marginTop: 20,
        letterSpacing: "2px",
      }}>
        @maricota.atelie
      </p>
    </AbsoluteFill>
  );
};

export const StoriesApresentacao: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#fdf8f3" }}>
      <Sequence from={0} durationInFrames={INTRO_DURATION}>
        <Intro />
      </Sequence>

      {produtos.map((produto, i) => {
        const from = INTRO_DURATION + i * (SLIDE_DURATION + TRANSITION);
        return (
          <Sequence key={i} from={from} durationInFrames={SLIDE_DURATION + TRANSITION}>
            <ProductSlide produto={produto} isStories={true} />
          </Sequence>
        );
      })}

      <Sequence
        from={INTRO_DURATION + produtos.length * (SLIDE_DURATION + TRANSITION)}
        durationInFrames={OUTRO_DURATION}
      >
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
