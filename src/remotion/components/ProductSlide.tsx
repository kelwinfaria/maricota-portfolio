import {
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Produto } from "../data/produtos";

const SLIDE_FRAMES = 75;

interface Props {
  produto: Produto;
  isStories: boolean;
}

export const ProductSlide: React.FC<Props> = ({ produto, isStories }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in/out do slide inteiro
  const opacity = interpolate(
    frame,
    [0, 8, SLIDE_FRAMES - 10, SLIDE_FRAMES],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Ken Burns — zoom lento na imagem
  const imgScale = interpolate(frame, [0, SLIDE_FRAMES], [1.0, 1.12], {
    extrapolateRight: "clamp",
  });

  // Linha decorativa que cresce da esquerda
  const lineWidth = spring({ frame: frame - 15, fps, config: { damping: 30, stiffness: 80 } });

  // Textos com stagger — cada um entra em momento diferente
  const tagOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [10, 25], [20, 0], { extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [20, 38], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [20, 38], [30, 0], { extrapolateRight: "clamp" });

  const descOpacity = interpolate(frame, [32, 48], [0, 1], { extrapolateRight: "clamp" });
  const descY = interpolate(frame, [32, 48], [20, 0], { extrapolateRight: "clamp" });

  const priceScale = spring({ frame: frame - 45, fps, config: { damping: 14, stiffness: 140 } });
  const priceOpacity = interpolate(frame, [45, 58], [0, 1], { extrapolateRight: "clamp" });

  const fontSize = isStories
    ? { tag: 26, title: 68, desc: 28, price: 50 }
    : { tag: 22, title: 52, desc: 22, price: 40 };

  const padding = isStories ? "60px 52px" : "40px 48px";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        opacity,
      }}
    >
      {/* Imagem com Ken Burns */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${staticFile(produto.imagem)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `scale(${imgScale})`,
          transformOrigin: "center center",
        }}
      />

      {/* Overlay em três camadas para profundidade */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(10,6,4,0.92) 0%, rgba(10,6,4,0.55) 40%, rgba(10,6,4,0.05) 75%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.25) 0%, transparent 60%)",
        }}
      />

      {/* Conteúdo */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding,
        }}
      >
        {/* Tag superior */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: fontSize.tag,
            color: "#e8b87d",
            margin: "0 0 12px 0",
            letterSpacing: "4px",
            textTransform: "uppercase",
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
          }}
        >
          ✦ Maricota Ateliê
        </p>

        {/* Linha decorativa */}
        <div
          style={{
            width: `${Math.min(1, lineWidth) * 80}px`,
            height: "2px",
            background: "linear-gradient(to right, #c9956e, transparent)",
            marginBottom: 18,
          }}
        />

        {/* Título */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: fontSize.title,
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 14px 0",
            lineHeight: 1.1,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          }}
        >
          {produto.nome}
        </h2>

        {/* Descrição */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: fontSize.desc,
            color: "rgba(255,255,255,0.82)",
            margin: "0 0 28px 0",
            lineHeight: 1.6,
            maxWidth: isStories ? "85%" : "75%",
            opacity: descOpacity,
            transform: `translateY(${descY}px)`,
          }}
        >
          {produto.descricao.length > 80
            ? produto.descricao.slice(0, 80) + "…"
            : produto.descricao}
        </p>

        {/* Preço com pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            opacity: priceOpacity,
            transform: `scale(${Math.max(0, priceScale)})`,
            transformOrigin: "left center",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #c9956e, #a5704a)",
              borderRadius: "100px",
              padding: isStories ? "16px 44px" : "12px 32px",
              boxShadow: "0 8px 32px rgba(201,149,110,0.35)",
            }}
          >
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: fontSize.price,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "1px",
              }}
            >
              {produto.preco}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
