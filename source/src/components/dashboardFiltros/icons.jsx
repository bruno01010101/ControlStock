const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

// Organização
export const BuildingIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" />
    <path d="M14 10h5a1 1 0 0 1 1 1v10" />
    <path d="M3 21h18" />
    <path d="M8 8h2M8 12h2M8 16h2" />
  </svg>
);

// Unidades
export const StoreIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M5 12v8h14v-8" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

// Período de análise
export const CalendarIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 3v4M16 3v4" />
  </svg>
);

// Seta do select
export const ChevronIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
