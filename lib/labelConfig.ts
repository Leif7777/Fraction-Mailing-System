export interface CustomTag {
  name: string;
  color: string; // hex, e.g. "#82c882"
}

export interface LabelStyle {
  bg: string;
  color: string;
  border: string;
  dot: string;
  short: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const DEFAULTS: Record<string, { hex: string; short: string }> = {
  Urgent:        { hex: "#dc2626", short: "Urgent" },
  "Needs Reply": { hex: "#d97706", short: "Reply" },
  FYI:           { hex: "#0284c7", short: "FYI" },
  Ignore:        { hex: "#9ca3af", short: "Ignore" },
};

export const DEFAULT_LABEL_NAMES = Object.keys(DEFAULTS);

export const TAG_COLOR_PRESETS: { hex: string; name: string }[] = [
  { hex: "#dc2626", name: "Red" },
  { hex: "#d97706", name: "Amber" },
  { hex: "#0284c7", name: "Blue" },
  { hex: "#82c882", name: "Green" },
  { hex: "#7c3aed", name: "Purple" },
  { hex: "#db2777", name: "Pink" },
  { hex: "#ea580c", name: "Orange" },
  { hex: "#0d9488", name: "Teal" },
];

export function getLabelStyle(label: string, customTags: CustomTag[]): LabelStyle {
  const def = DEFAULTS[label];
  if (def) {
    return {
      bg:     hexToRgba(def.hex, 0.08),
      color:  def.hex,
      border: hexToRgba(def.hex, 0.25),
      dot:    def.hex,
      short:  def.short,
    };
  }
  const custom = customTags.find((t) => t.name === label);
  const hex = custom?.color ?? "#9ca3af";
  const name = label.length > 9 ? label.slice(0, 8) + "…" : label;
  return {
    bg:     hexToRgba(hex, 0.08),
    color:  hex,
    border: hexToRgba(hex, 0.25),
    dot:    hex,
    short:  name,
  };
}
