import type { FontPreset } from "../stores/useSpv2Store";

const FONT_CLASS_MAP: Record<
  FontPreset,
  { heading: string; body: string; accent: string }
> = {
  clean: {
    heading: "font-semibold tracking-tight text-slate-900",
    body: "text-slate-600",
    accent: "text-xs uppercase tracking-[0.3em] text-slate-400",
  },
  friendly: {
    heading: "font-semibold text-slate-900 tracking-wide",
    body: "text-slate-700",
    accent: "text-xs uppercase tracking-[0.2em] text-slate-500",
  },
  bold: {
    heading: "font-bold text-slate-900 uppercase tracking-wide",
    body: "text-slate-800",
    accent: "text-[0.7rem] uppercase tracking-[0.4em] text-slate-500",
  },
};

export const getFontPresetClasses = (preset: FontPreset) => FONT_CLASS_MAP[preset] ?? FONT_CLASS_MAP.clean;
