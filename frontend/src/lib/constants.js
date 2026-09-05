export const MODES = [
  { id: 'normal', label: 'NORMAL', tagline: 'Direct. Factual.', desc: 'Neutral, logical, no emotional padding.', dot: '#9ca3af', badge: null },
  { id: '0-filter', label: '0-FILTER', tagline: 'No filter. No mercy.', desc: 'Brutally honest. Profanity allowed. 13+ only.', dot: '#ef4444', badge: '13+' },
  { id: 'people-pleaser', label: 'PEOPLE-PLEASER', tagline: 'Warm. Honest.', desc: 'Soft tone, still the full truth.', dot: '#22c55e', badge: null },
  { id: 'political', label: 'POLITICAL', tagline: 'Policy, not parties.', desc: 'Blunt policy analysis. No endorsements.', dot: '#3b82f6', badge: null },
  { id: 'short', label: 'SHORT', tagline: 'Concise. No fluff.', desc: 'Concise. No fluff.', dot: '#eab308', badge: null },
];

export const modeById = (id) => MODES.find((m) => m.id === id) || MODES[0];

export const MODELS = [
  { id: 'gpt-5', label: 'GPT-5', provider: 'openai', note: 'Balanced flagship' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai', note: 'Fast + cheap' },
  { id: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5', provider: 'anthropic', note: 'Great all-rounder' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', provider: 'anthropic', note: 'Snappy replies' },
  { id: 'claude-opus-4-5-20251101', label: 'Claude Opus 4.5', provider: 'anthropic', note: 'Best for code' },
];

export const modelById = (id) => MODELS.find((m) => m.id === id) || MODELS[0];

export const FONTS = [
  { id: 'modern', label: 'MODERN', stack: "'Inter', sans-serif" },
  { id: 'serif', label: 'SERIF', stack: "'Lora', serif" },
  { id: 'mono', label: 'MONO', stack: "'JetBrains Mono', monospace" },
  { id: 'rounded', label: 'ROUNDED', stack: "'Nunito', sans-serif" },
  { id: 'playful', label: 'PLAYFUL', stack: "'Baloo 2', cursive" },
  { id: 'grotesk', label: 'GROTESK', stack: "'Space Grotesk', sans-serif" },
  { id: 'editorial', label: 'EDITORIAL', stack: "'Playfair Display', serif" },
  { id: 'geometric', label: 'GEOMETRIC', stack: "'Poppins', sans-serif" },
  { id: 'slab', label: 'SLAB', stack: "'Roboto Slab', serif" },
  { id: 'code', label: 'CODE', stack: "'Fira Code', monospace" },
  { id: 'display', label: 'DISPLAY', stack: "'Archivo Black', sans-serif" },
  { id: 'literary', label: 'LITERARY', stack: "'EB Garamond', serif" },
];

export const fontById = (id) => FONTS.find((f) => f.id === id) || FONTS[2];

export const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'amoled', label: 'AMOLED' },
];

export const ACCENTS = [
  { id: 'blue', hex: '#3b82f6' },
  { id: 'purple', hex: '#a855f7' },
  { id: 'green', hex: '#22c55e' },
  { id: 'orange', hex: '#f97316' },
  { id: 'pink', hex: '#ec4899' },
  { id: 'red', hex: '#ef4444' },
  { id: 'teal', hex: '#14b8a6' },
];

export const BACKGROUNDS = [
  { id: 'default', label: 'DEFAULT' },
  { id: 'pure-black', label: 'PURE BLACK' },
  { id: 'pure-white', label: 'PURE WHITE' },
  { id: 'slate', label: 'SLATE' },
  { id: 'sunset', label: 'SUNSET' },
  { id: 'ocean', label: 'OCEAN' },
  { id: 'forest', label: 'FOREST' },
  { id: 'grid', label: 'GRID' },
  { id: 'noise', label: 'NOISE' },
  { id: 'mesh', label: 'MESH' },
  { id: 'aurora', label: 'AURORA' },
  { id: 'candy', label: 'CANDY' },
  { id: 'midnight', label: 'MIDNIGHT' },
  { id: 'peach', label: 'PEACH' },
  { id: 'mono-fade', label: 'MONO FADE' },
  { id: 'dots', label: 'DOTS' },
  { id: 'stripes', label: 'STRIPES' },
  { id: 'topo', label: 'TOPO' },
  { id: 'blueprint', label: 'BLUEPRINT' },
  { id: 'carbon', label: 'CARBON' },
];

export const GUEST_LIMIT = 10;
