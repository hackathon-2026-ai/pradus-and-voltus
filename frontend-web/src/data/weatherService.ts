// ===== WEATHER SERVICE — Simulated weather for energy facility demo =====
import type { EnergyFacility } from './energyFacilities';

export interface WeatherData {
  windSpeed: number;      // m/s (0–25)
  sunshineIndex: number;  // 0–1 (0 = overcast, 1 = full sun)
  temperature: number;    // °C
  rainProbability: number; // 0–1
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'windy' | 'stormy';
  conditionLabel: string;
}

export interface FacilityMetrics {
  currentOutputMW: number;
  efficiency: number;         // 0-100
  weatherImpact: number;      // -50 to +50 (percentage change)
  weatherExplanation: string;
  dailyOutputMWh: number;
  co2Factor: number;          // tons CO2 per MWh (0 for renewables)
  gridContribution: number;   // percentage of local grid
  operatingCostPerMWh: number;
  // House-specific
  consumptionMW?: number;
  monthlyBillPLN?: number;
  efficiencyRating?: string;  // A-G
  nearbySuppliers?: string[];
}

// Time-seeded pseudo-random for consistent weather within short windows
function timeSeededRandom(seed: number): number {
  let s = seed;
  s = (s * 16807 + 0) % 2147483647;
  return (s - 1) / 2147483646;
}

/** Get current simulated weather — changes every 5 minutes */
export function getCurrentWeather(): WeatherData {
  const now = Date.now();
  const timeSeed = Math.floor(now / (5 * 60 * 1000)); // changes every 5 min
  
  const r1 = timeSeededRandom(timeSeed * 7919);
  const r2 = timeSeededRandom(timeSeed * 6271);
  const r3 = timeSeededRandom(timeSeed * 8369);
  const r4 = timeSeededRandom(timeSeed * 5431);

  const windSpeed = Math.round((r1 * 20 + 2) * 10) / 10;
  const sunshineIndex = Math.round(r2 * 100) / 100;
  const temperature = Math.round((r3 * 30 - 5) * 10) / 10;
  const rainProbability = Math.round(r4 * 100) / 100;

  let condition: WeatherData['condition'];
  let conditionLabel: string;

  if (windSpeed > 15 && rainProbability > 0.6) {
    condition = 'stormy';
    conditionLabel = 'Burzowo';
  } else if (windSpeed > 12) {
    condition = 'windy';
    conditionLabel = 'Wietrznie';
  } else if (rainProbability > 0.5) {
    condition = 'rainy';
    conditionLabel = 'Deszczowo';
  } else if (sunshineIndex < 0.3) {
    condition = 'cloudy';
    conditionLabel = 'Pochmurno';
  } else if (sunshineIndex < 0.6) {
    condition = 'partly-cloudy';
    conditionLabel = 'Częściowe zachmurzenie';
  } else {
    condition = 'sunny';
    conditionLabel = 'Słonecznie';
  }

  return { windSpeed, sunshineIndex, temperature, rainProbability, condition, conditionLabel };
}

/** Compute facility output & efficiency based on current weather */
export function computeFacilityMetrics(
  facility: EnergyFacility,
  weather: WeatherData,
  allFacilities: EnergyFacility[] = [],
): FacilityMetrics {
  const { type, capacityMW, baseEfficiency, weatherSensitivity: ws } = facility;

  // Calculate weather impact
  const windBoost = ws.wind * (weather.windSpeed / 12); // normalized to "good wind" ~12 m/s
  const sunBoost = ws.sun * weather.sunshineIndex;
  const rainPenalty = ws.rain * weather.rainProbability;

  const weatherMultiplier = 1 + windBoost + sunBoost - rainPenalty;
  const clampedMultiplier = Math.max(0.2, Math.min(1.8, weatherMultiplier));

  const efficiency = Math.round(Math.min(100, Math.max(10, baseEfficiency * clampedMultiplier)));
  const weatherImpact = Math.round((clampedMultiplier - 1) * 100);

  // Explanation
  let weatherExplanation = '';
  if (type === 'wind') {
    if (weather.windSpeed > 12) weatherExplanation = `Silny wiatr (${weather.windSpeed} m/s) zwiększa produkcję o ${weatherImpact}%`;
    else if (weather.windSpeed > 6) weatherExplanation = `Umiarkowany wiatr (${weather.windSpeed} m/s) — dobre warunki`;
    else weatherExplanation = `Słaby wiatr (${weather.windSpeed} m/s) zmniejsza produkcję`;
  } else if (type === 'solar') {
    if (weather.sunshineIndex > 0.7) weatherExplanation = `Intensywne nasłonecznienie zwiększa produkcję o ${weatherImpact}%`;
    else if (weather.sunshineIndex > 0.4) weatherExplanation = `Częściowe zachmurzenie — umiarkowana produkcja`;
    else weatherExplanation = `Duże zachmurzenie zmniejsza generację solarną`;
  } else if (type === 'hydro') {
    if (weather.rainProbability > 0.5) weatherExplanation = `Opady zwiększają przepływ wody — produkcja w górę o ${weatherImpact}%`;
    else weatherExplanation = `Normalny poziom wody — stabilna generacja`;
  } else if (type === 'coal') {
    weatherExplanation = 'Elektrownia cieplna — minimalna zależność od pogody';
  } else if (type === 'storage') {
    weatherExplanation = 'Magazyn bateryjny — niezależny od pogody';
  } else if (type === 'biomass') {
    weatherExplanation = 'Biomasa — stabilne dostawy paliwa, niewielki wpływ pogody';
  } else if (type === 'house') {
    if (weather.temperature < 5) weatherExplanation = `Zimno (${weather.temperature}°C) — duże zapotrzebowanie na ogrzewanie`;
    else if (weather.temperature > 25) weatherExplanation = `Upał (${weather.temperature}°C) — wzrost zapotrzebowania na chłodzenie`;
    else weatherExplanation = `Łagodna pogoda (${weather.temperature}°C) — przeciętne zużycie`;
  }

  // Output calculation
  let currentOutputMW: number;
  if (type === 'house') {
    currentOutputMW = 0;
  } else {
    currentOutputMW = Math.round(capacityMW * (efficiency / 100) * 10) / 10;
  }
  const dailyOutputMWh = Math.round(currentOutputMW * 24 * 0.85 * 10) / 10;

  // CO2 factor (tons per MWh)
  const co2Factors: Record<string, number> = {
    coal: 0.92, wind: 0, solar: 0, hydro: 0, storage: 0, biomass: 0.03, house: 0.45,
  };
  const co2Factor = co2Factors[type] ?? 0;

  // Grid contribution estimate (% of regional capacity)
  const gridContribution = type === 'house' ? 0 : Math.round(Math.min(currentOutputMW / 50, 100) * 10) / 10;

  // Operating cost per MWh (PLN)
  const costMap: Record<string, number> = {
    coal: 280, wind: 45, solar: 55, hydro: 35, storage: 120, biomass: 180, house: 0,
  };
  const operatingCostPerMWh = costMap[type] ?? 0;

  // House-specific
  const isHouse = type === 'house';
  const consumptionMW = isHouse ? Math.round((3.5 + (weather.temperature < 5 ? 2.5 : weather.temperature > 25 ? 1.8 : 0)) * 10) / 10 : undefined;
  const monthlyBillPLN = isHouse ? Math.round((consumptionMW! * 24 * 30 * 0.75) * 10) / 10 : undefined;

  let efficiencyRating: string | undefined;
  if (isHouse) {
    if (efficiency >= 80) efficiencyRating = 'A';
    else if (efficiency >= 70) efficiencyRating = 'B';
    else if (efficiency >= 60) efficiencyRating = 'C';
    else if (efficiency >= 50) efficiencyRating = 'D';
    else if (efficiency >= 40) efficiencyRating = 'E';
    else if (efficiency >= 30) efficiencyRating = 'F';
    else efficiencyRating = 'G';
  }

  const nearbySuppliers = isHouse ? getNearbySuppliers(facility, allFacilities) : undefined;

  return {
    currentOutputMW,
    efficiency,
    weatherImpact,
    weatherExplanation,
    dailyOutputMWh,
    co2Factor,
    gridContribution,
    operatingCostPerMWh,
    consumptionMW,
    monthlyBillPLN,
    efficiencyRating,
    nearbySuppliers,
  };
}

/** Find 2-3 nearest energy suppliers to a house */
function getNearbySuppliers(house: EnergyFacility, allFacilities: EnergyFacility[]): string[] {
  const suppliers = allFacilities
    .filter(f => f.type !== 'house' && f.province === house.province)
    .sort((a, b) => {
      const da = Math.hypot(a.lat - house.lat, a.lng - house.lng);
      const db = Math.hypot(b.lat - house.lat, b.lng - house.lng);
      return da - db;
    })
    .slice(0, 3)
    .map(f => f.name);
  return suppliers.length > 0 ? suppliers : ['Sieć regionalna'];
}

/** Weather condition icon SVG string for map / sidebar */
export function getWeatherIconSVG(condition: WeatherData['condition']): string {
  switch (condition) {
    case 'sunny':
      return '<circle cx="12" cy="12" r="5" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="2"><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></g>';
    case 'partly-cloudy':
      return '<circle cx="10" cy="10" r="4" fill="#fbbf24"/><path d="M17 18H7a4 4 0 0 1-.8-7.9A5 5 0 0 1 16.8 12h.4a3 3 0 0 1 0 6z" fill="#94a3b8"/>';
    case 'cloudy':
      return '<path d="M18 18H6a4 4 0 0 1-.8-7.9A5 5 0 0 1 15.8 12H17a3.5 3.5 0 0 1 1 6.9z" fill="#64748b"/>';
    case 'rainy':
      return '<path d="M17 16H6a4 4 0 0 1-.8-7.9A5 5 0 0 1 15.8 10H17a3 3 0 0 1 0 6z" fill="#64748b"/><line x1="8" y1="19" x2="8" y2="22" stroke="#3b82f6" stroke-width="2"/><line x1="12" y1="19" x2="12" y2="22" stroke="#3b82f6" stroke-width="2"/><line x1="16" y1="19" x2="16" y2="22" stroke="#3b82f6" stroke-width="2"/>';
    case 'windy':
      return '<path d="M9.59 4.59A2 2 0 1 1 11 8H2" stroke="#22d3ee" stroke-width="2" fill="none"/><path d="M12.59 19.41A2 2 0 1 0 14 16H2" stroke="#22d3ee" stroke-width="2" fill="none"/><path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2" stroke="#22d3ee" stroke-width="2" fill="none"/>';
    case 'stormy':
      return '<path d="M17 16H6a4 4 0 0 1-.8-7.9A5 5 0 0 1 15.8 10H17a3 3 0 0 1 0 6z" fill="#475569"/><polygon points="13 14 8 21 12 21 11 24 16 17 12 17" fill="#fbbf24"/>';
    default:
      return '<circle cx="12" cy="12" r="5" fill="#fbbf24"/>';
  }
}
