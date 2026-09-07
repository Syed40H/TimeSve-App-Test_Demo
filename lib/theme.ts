// The single source of colour, spacing and type for TimeSve.
// No screen contains a raw hex value.

export const colors = {
  bg: '#FAF8EF', // warm cream, never white
  card: '#FFFFFF',
  border: '#E9E6D8',

  ink: '#1A1A18', // near-black, never pure black
  muted: '#8B8B80',
  faint: '#B5B4A8',

  green: '#4A9E52', // brand: mascot, chart bars
  greenDark: '#3D8442', // button fills — 4.6:1 against white, passes AA
  greenDeep: '#2C6B31', // text on a green tint
  greenTint: '#E4F0DF',
  greenSoft: '#C7E0C2',

  danger: '#B54B42',
  dangerBorder: '#E0A9A4',

  onDark: '#FAF8EF', // text on ink
  onGreen: '#FFFFFF',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

// Two radii do all the work: pills for small tappable things, cards for the rest.
export const radius = {
  card: 16,
  row: 14,
  pill: 999,
} as const;

// The reference design gets its punch from weight contrast, not size.
export const type = {
  display: { fontSize: 52, fontWeight: '800', letterSpacing: -1.6 },
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  title: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  small: { fontSize: 13, fontWeight: '400' },
  // The tiny wide-tracked caps label above a group.
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
} as const;
