/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PETT Modern Playful (selected Stitch redesign)
        "primary": "#006b5f",
        "primary-dim": "#005048",
        "primary-fixed": "#71f8e4",
        "primary-fixed-dim": "#4fdbc8",
        "primary-container": "#14b8a6",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#00201c",
        "on-primary-fixed-variant": "#005048",
        "on-primary-container": "#00423b",

        "secondary": "#ae2f34",
        "secondary-dim": "#8c1520",
        "secondary-fixed": "#ffdad8",
        "secondary-fixed-dim": "#ffb3b0",
        "secondary-container": "#ff6b6b",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#410006",
        "on-secondary-fixed-variant": "#8c1520",
        "on-secondary-container": "#6d0010",

        "tertiary": "#6d5e00",
        "tertiary-dim": "#524600",
        "tertiary-fixed": "#fbe36a",
        "tertiary-fixed-dim": "#dec651",
        "tertiary-container": "#baa432",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed": "#211b00",
        "on-tertiary-fixed-variant": "#524600",
        "on-tertiary-container": "#443a00",

        "surface": "#fbfaee",
        "surface-bright": "#fbfaee",
        "surface-dim": "#dbdbcf",
        "surface-container": "#efeee3",
        "surface-container-high": "#e9e9dd",
        "surface-container-highest": "#e4e3d7",
        "surface-container-low": "#f5f4e8",
        "surface-container-lowest": "#ffffff",
        "surface-tint": "#006b5f",
        "surface-variant": "#e4e3d7",
        "on-surface": "#1b1c15",
        "on-surface-variant": "#3c4947",

        "error": "#ba1a1a",
        "error-dim": "#93000a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        "background": "#fbfaee",
        "on-background": "#1b1c15",

        "outline": "#6c7a77",
        "outline-variant": "#bbcac6",

        "inverse-surface": "#303129",
        "inverse-on-surface": "#f2f1e5",
        "inverse-primary": "#4fdbc8",
      },
      borderRadius: {
        "DEFAULT": "1.5rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "Be Vietnam Pro", "sans-serif"],
        body: ["Be Vietnam Pro", "sans-serif"],
        label: ["Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        "ambient-xs": "0 2px 4px rgba(45, 47, 48, 0.04)",
        "ambient-sm": "0 4px 8px rgba(45, 47, 48, 0.06)",
        "ambient": "0 8px 16px rgba(45, 47, 48, 0.08)",
        "ambient-lg": "0 16px 32px rgba(45, 47, 48, 0.08)",
        "ambient-xl": "0 32px 48px rgba(45, 47, 48, 0.08)",
      },
    },
  },
  plugins: [],
}
