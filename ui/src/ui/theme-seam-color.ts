/**
 * Utilities for applying the `ui.seamColor` accent-color override from
 * openclaw.json to the document's CSS custom properties.
 *
 * Kept in a separate module (rather than app-settings.ts) so that
 * controllers/config.ts and controllers/control-ui-bootstrap.ts can import it
 * without creating a circular dependency through app-settings.ts.
 */

/**
 * Parse a 3- or 6-digit hex color string (#RGB or #RRGGBB) into
 * [r, g, b] components (0–255). Returns null for unrecognized input.
 */
function parseHexColor(hex: string): [number, number, number] | null {
  const cleaned = hex.trim().replace(/^#/, "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }
    return [r, g, b];
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }
    return [r, g, b];
  }
  return null;
}

/**
 * Blend an RGB color toward white by `amount` (0–1) to produce a lighter variant.
 */
function lighten([r, g, b]: [number, number, number], amount: number): [number, number, number] {
  return [
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount),
  ];
}

const SEAM_PROPERTIES = [
  "--accent",
  "--accent-hover",
  "--accent-muted",
  "--accent-subtle",
  "--accent-foreground",
  "--accent-glow",
  "--primary",
  "--primary-foreground",
  "--ring",
  "--focus",
] as const;

/**
 * Apply `ui.seamColor` from openclaw.json to the document's CSS custom
 * properties so that buttons, sidebar highlights, and other accented elements
 * use the configured color instead of the hardcoded theme default.
 *
 * Passing `null` or `undefined` removes any previously applied override and
 * restores the theme's CSS-defined defaults.
 */
export function applySeamColor(color: string | null | undefined): void {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;

  if (!color) {
    // Remove overrides so the CSS-defined theme values take over.
    for (const prop of SEAM_PROPERTIES) {
      root.style.removeProperty(prop);
    }
    return;
  }

  const rgb = parseHexColor(color);
  if (!rgb) {
    return;
  }

  const [r, g, b] = rgb;
  const hoverRgb = lighten(rgb, 0.1);
  const hex = color.trim().startsWith("#") ? color.trim() : `#${color.trim()}`;
  const hoverHex = `#${hoverRgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

  root.style.setProperty("--accent", hex);
  root.style.setProperty("--accent-hover", hoverHex);
  root.style.setProperty("--accent-muted", hex);
  root.style.setProperty("--accent-subtle", `rgba(${r}, ${g}, ${b}, 0.12)`);
  root.style.setProperty("--accent-foreground", "#ffffff");
  root.style.setProperty("--accent-glow", `rgba(${r}, ${g}, ${b}, 0.22)`);
  root.style.setProperty("--primary", hex);
  root.style.setProperty("--primary-foreground", "#ffffff");
  root.style.setProperty("--ring", hex);
  root.style.setProperty("--focus", `rgba(${r}, ${g}, ${b}, 0.22)`);
}
