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
export function generateCountyEnergy(countyName: string): EnergyData {
  const rng = seededRandom(hashString(countyName));
  const isCity = countyName.startsWith('powiat ') && countyName.charAt(7) === countyName.charAt(7).toUpperCase();
  const base = isCity ? 120 : 40;
  const capacityMW = Math.round((base + rng() * 200) * 10) / 10;
  const loadFactor = 0.4 + rng() * 0.45;
  const usageMW = Math.round(capacityMW * loadFactor * 10) / 10;
  const availableMW = Math.round((capacityMW - usageMW) * 10) / 10;
  return {
    usageMW,
    capacityMW,
    availableMW,
    gridStability: Math.round(82 + rng() * 16),
    renewableShare: Math.round(5 + rng() * 45),
    reserveMargin: Math.round(10 + rng() * 45)
  };
}

// ===== COLOR UTIL =====
export function getLoadColor(usage: number, capacity: number): string {
  const load = (usage / capacity) * 100;
  if (load > 80) return '#dc2626';
  if (load > 65) return '#f59e0b';
  if (load > 50) return '#3b82f6';
  return '#22c55e';
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
    const d = generateCountyEnergy(f.properties.nazwa);
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
