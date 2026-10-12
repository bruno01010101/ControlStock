const TAMANHOS = { small: 24, large: 56 };

/**
 * Spinner azul em SVG.
 * Props:
 * - size: "small" | "large" (padrão: "large")
 */
export default function Loading({ size = "large" }) {
  const px = TAMANHOS[size] ?? TAMANHOS.large;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 50 50"
      role="status"
      aria-label="Carregando"
    >
      {/* trilho claro */}
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#dbeafe"
        strokeWidth="5"
      />
      {/* arco azul girando */}
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#2563eb"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="31.4 125.6"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="0.9s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
