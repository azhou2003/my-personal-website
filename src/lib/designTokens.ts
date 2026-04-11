// Design guideline:
// - Use semantic tokens from globals.css instead of raw hex values in TS/TSX.
// - Only use direct colors when a one-off visual effect cannot be represented by a token.
export const designTokens = {
  switchTrackOff: "var(--color-switch-track-off)",
  switchTrackOn: "var(--color-switch-track-on)",
  switchThumb: "var(--color-switch-thumb)",
  switchThumbBorder: "var(--color-switch-thumb-border)",
  switchRing: {
    light: "0 0 0 4px rgba(183, 199, 163, 0.3)",
    dark: "0 0 0 4px rgba(63, 74, 54, 0.3)",
  },
} as const;
