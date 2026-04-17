// ===== TILE LAYERS =====
export interface TileConfig {
  url: string;
  attribution: string;
}

export const TILE_LAYERS: Record<string, TileConfig> = {
  dark:      { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',   attribution: '&copy; OSM &copy; CARTO' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
  light:     { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',   attribution: '&copy; OSM &copy; CARTO' }
};

export const TILE_ORDER: string[] = ['dark', 'satellite', 'light'];
