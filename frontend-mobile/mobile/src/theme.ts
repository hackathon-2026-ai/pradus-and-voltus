// ===== DESIGN TOKENS (matches web CSS variables) =====
export const Colors = {
  bgPrimary: '#0a0e1a',
  bgSecondary: '#111827',
  bgCard: 'rgba(17, 24, 39, 0.8)',
  bgGlass: 'rgba(255, 255, 255, 0.03)',
  bgGlassHover: 'rgba(255, 255, 255, 0.07)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderActive: 'rgba(99, 102, 241, 0.5)',

  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  accentPrimary: '#6366f1',
  accentSecondary: '#8b5cf6',
  accentCyan: '#22d3ee',
  accentEmerald: '#10b981',
  accentAmber: '#f59e0b',
  accentRose: '#f43f5e',

  wind: '#22d3ee',
  solar: '#fbbf24',
  coal: '#78716c',
  hydro: '#3b82f6',
  storage: '#a855f7',
  biomass: '#22c55e',
  house: '#f97316',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
};

// Dark map style for Google Maps
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'land', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];
