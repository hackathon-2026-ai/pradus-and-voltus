import type { Feature, FeatureCollection, Geometry } from 'geojson';

// ===== TYPES =====
export interface CountyProperties {
  nazwa: string;
  province: string;
  [key: string]: unknown;
}

export interface ProvinceProperties {
  nazwa: string;
  [key: string]: unknown;
}

export type CountyFeature = Feature<Geometry, CountyProperties>;
export type ProvinceFeature = Feature<Geometry, ProvinceProperties>;
export type CountyFeatureCollection = FeatureCollection<Geometry, CountyProperties>;
export type ProvinceFeatureCollection = FeatureCollection<Geometry, ProvinceProperties>;

export interface EnergyData {
  usageMW: number;
  capacityMW: number;
  availableMW: number;
  gridStability: number;
  renewableShare: number;
  reserveMargin: number;
}

// ===== SEEDED RANDOM FOR COUNTY DATA =====
function seededRandom(seed: number): () => number {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate deterministic energy data for a county
export function generateCountyEnergy(countyName: string, provinceName: string = ''): EnergyData {
  const rng = seededRandom(hashString(countyName));
  const isCity = countyName.startsWith('powiat ') && countyName.charAt(7) === countyName.charAt(7).toUpperCase();
  
  // Base capacity tuned so ~380 counties sum to ~72 GW (Poland's real 2024 capacity)
  const base = isCity ? 200 : 60;
  const capacityMW = Math.round((base + rng() * 200) * 10) / 10;
  
  // Province-level modifier to create wider variance across the map (0.6 to 1.5)
  let provModifier = 1.0;
  if (provinceName) {
    const provRng = seededRandom(hashString(provinceName));
    provModifier = 0.6 + provRng() * 0.9;
  }
  
  // Load factor skewed towards lower values to make map mostly green, with occasional high loads
  const r = rng();
  let loadFactor = (0.25 + Math.pow(r, 2) * 0.65) * provModifier;
  if (loadFactor > 0.95) loadFactor = 0.95; // Cap at 95%
  
  const usageMW = Math.round(capacityMW * loadFactor * 10) / 10;
  const availableMW = Math.round((capacityMW - usageMW) * 10) / 10;
  
  return {
    usageMW,
    capacityMW,
    availableMW,
    gridStability: Math.round(85 + rng() * 15),
    renewableShare: Math.round(15 + rng() * 45),
    reserveMargin: Math.round((availableMW / capacityMW) * 100)
  };
}

// ===== COLOR UTIL =====
export function getLoadColor(usage: number, capacity: number): string {
  const load = (usage / capacity) * 100;
  if (load > 70) return '#d13535'; // Red
  if (load > 60) return '#e07628'; // Orange
  if (load > 50) return '#f4b916'; // Yellow
  if (load > 40) return '#98c93c'; // Yellow-Green
  return '#32c544'; // Green
}

// ===== COUNTY HELPERS =====
export function getCountiesForProvince(
  countyGeoData: CountyFeatureCollection | null,
  provinceName: string
): CountyFeature[] {
  if (!countyGeoData) return [];
  return countyGeoData.features.filter(f => f.properties.province === provinceName);
}

export function aggregateCountyData(countyFeatures: CountyFeature[]): EnergyData {
  let totalUsage = 0, totalCapacity = 0, totalAvailable = 0;
  let sumStability = 0, sumRenewable = 0, sumReserve = 0;
  const n = countyFeatures.length || 1;
  countyFeatures.forEach(f => {
    const d = generateCountyEnergy(f.properties.nazwa, f.properties.province);
    totalUsage += d.usageMW;
    totalCapacity += d.capacityMW;
    totalAvailable += d.availableMW;
    sumStability += d.gridStability;
    sumRenewable += d.renewableShare;
    sumReserve += d.reserveMargin;
  });
  return {
    usageMW: totalUsage,
    capacityMW: totalCapacity,
    availableMW: totalAvailable,
    gridStability: Math.round(sumStability / n),
    renewableShare: Math.round(sumRenewable / n),
    reserveMargin: Math.round(sumReserve / n)
  };
}
