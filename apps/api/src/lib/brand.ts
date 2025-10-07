import { Vibrant } from "node-vibrant/node";
import type { UserSettings } from "@stackquotes/types";

const FALLBACK_ACCENT = "#2563eb";

export interface BrandTheme {
  companyName: string;
  logoUrl?: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  accentText: string;
  neutralBorder: string;
}

interface BuildThemeOptions {
  companyName?: string;
  logoUrl?: string;
  accentColor?: string;
}

export const normalizeHex = (value: string): string => {
  const trimmed = value.trim();
  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (hex.length === 3) {
    return `#${hex.split("").map((char) => char + char).join("")}`.toLowerCase();
  }
  return `#${hex.toLowerCase()}`;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const normalized = normalizeHex(hex).slice(1);
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (component: number) =>
    component.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mix = (color: string, target: string, ratio: number): string => {
  const sourceRgb = hexToRgb(color);
  const targetRgb = hexToRgb(target);
  const mixComponent = (component: keyof typeof sourceRgb) =>
    Math.round(sourceRgb[component] + (targetRgb[component] - sourceRgb[component]) * ratio);
  return rgbToHex(mixComponent("r"), mixComponent("g"), mixComponent("b"));
};

const lighten = (color: string, ratio: number) => mix(color, "#ffffff", ratio);
const darken = (color: string, ratio: number) => mix(color, "#000000", ratio);

const relativeLuminance = (color: string): number => {
  const { r, g, b } = hexToRgb(color);
  const transform = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
};

const pickAccentText = (accent: string): string => {
  const luminance = relativeLuminance(accent);
  const contrastWithWhite = (1.05) / (luminance + 0.05);
  const contrastWithBlack = (luminance + 0.05) / 0.05;
  return contrastWithWhite >= contrastWithBlack ? "#ffffff" : "#111827";
};

export async function extractAccentFromLogo(logoUrl?: string): Promise<string | null> {
  if (!logoUrl) return null;
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) {
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const palette = await Vibrant.from(buffer).getPalette();
    const swatch =
      palette.Vibrant ||
      palette.Muted ||
      palette.LightVibrant ||
      palette.DarkVibrant ||
      palette.LightMuted ||
      palette.DarkMuted;
    return swatch?.getHex() ?? null;
  } catch (error) {
    console.warn("Failed to extract accent color from logo", error);
    return null;
  }
}

export async function buildBrandTheme(options: BuildThemeOptions = {}): Promise<BrandTheme> {
  const { accentColor, logoUrl, companyName } = options;
  const accentFromLogo = await extractAccentFromLogo(logoUrl);
  const rawAccent = accentColor ?? accentFromLogo ?? FALLBACK_ACCENT;
  const accent = normalizeHex(rawAccent);
  const accentLight = lighten(accent, 0.2);
  const accentDark = darken(accent, 0.2);

  return {
    companyName: companyName ?? "Your Company",
    logoUrl,
    accent,
    accentLight,
    accentDark,
    accentText: pickAccentText(accent),
    neutralBorder: lighten(accent, 0.75),
  };
}

export async function buildThemeFromSettings(settings: UserSettings | null | undefined): Promise<BrandTheme> {
  return buildBrandTheme({
    companyName: settings?.companyName ?? undefined,
    logoUrl: settings?.logoUrl ?? undefined,
    accentColor: settings?.accentColor ?? undefined,
  });
}
