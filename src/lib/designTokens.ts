// Design guideline:
// - Use semantic tokens from globals.css instead of raw hex values in TS/TSX.
// - Only use direct colors when a one-off visual effect cannot be represented by a token.
export const designTokens = {
  switchTrackOff: "var(--color-switch-track-off)",
  switchTrackOn: "var(--color-switch-track-on)",
  switchThumb: "var(--color-switch-thumb)",
  switchThumbBorder: "var(--color-switch-thumb-border)",
  switchRing: "var(--color-switch-ring)",
  switchShadowActive: "var(--color-switch-shadow-active)",
  switchShadowIdle: "var(--color-switch-shadow-idle)",
} as const;
