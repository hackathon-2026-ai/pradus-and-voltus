// ===== ENERGY FACILITY TYPES & DATA =====
export type FacilityType = 'wind' | 'solar' | 'coal' | 'hydro' | 'storage' | 'biomass' | 'house';

export interface EnergyFacility {
  id: string;
  name: string;
  type: FacilityType;
  lat: number;
  lng: number;
  capacityMW: number;
  baseEfficiency?: number;
  weatherSensitivity: { wind: number; sun: number; rain: number; };
  province: string;
  description?: string;
  yearBuilt?: number;
  operator?: string;
}

export interface FacilityTypeConfig {
  label: string;
  color: string;
  glowColor: string;
}

export const FACILITY_TYPE_CONFIG: Record<FacilityType, FacilityTypeConfig> = {
  wind:    { label: 'Wind Farm',        color: '#22d3ee', glowColor: 'rgba(34,211,238,0.4)' },
  solar:   { label: 'Solar Park',       color: '#fbbf24', glowColor: 'rgba(251,191,36,0.4)' },
  coal:    { label: 'Coal Power Plant', color: '#78716c', glowColor: 'rgba(120,113,108,0.4)' },
  hydro:   { label: 'Hydroelectric',    color: '#3b82f6', glowColor: 'rgba(59,130,246,0.4)' },
  storage: { label: 'Energy Storage',   color: '#a855f7', glowColor: 'rgba(168,85,247,0.4)' },
  biomass: { label: 'Biomass Plant',    color: '#22c55e', glowColor: 'rgba(34,197,94,0.4)' },
  house:   { label: 'Residential Area', color: '#f97316', glowColor: 'rgba(249,115,22,0.4)' },
};

export const ENERGY_FACILITIES: EnergyFacility[] = [
  // WIND
  { id:'w1', name:'Potęgowo Wind Farm', type:'wind', lat:54.523, lng:17.493, capacityMW:220, baseEfficiency:78, weatherSensitivity:{wind:0.95,sun:0,rain:0.05}, province:'pomorskie', description:'One of Poland\'s largest onshore wind farms with 80 turbines.', yearBuilt:2019, operator:'Polenergia' },
  { id:'w2', name:'Margonin Wind Farm', type:'wind', lat:52.97, lng:17.34, capacityMW:120, baseEfficiency:72, weatherSensitivity:{wind:0.92,sun:0,rain:0.08}, province:'wielkopolskie', description:'Major wind installation with 60 Vestas turbines.', yearBuilt:2011, operator:'EDP Renewables' },
  { id:'w3', name:'Tychowo Wind Farm', type:'wind', lat:54.043, lng:16.253, capacityMW:50, baseEfficiency:74, weatherSensitivity:{wind:0.93,sun:0,rain:0.06}, province:'zachodniopomorskie', description:'Coastal wind farm benefiting from Baltic breezes.', yearBuilt:2015, operator:'RWE' },
  { id:'w4', name:'Kisielice Wind Farm', type:'wind', lat:53.6, lng:19.22, capacityMW:82, baseEfficiency:70, weatherSensitivity:{wind:0.90,sun:0,rain:0.07}, province:'warmińsko-mazurskie', description:'Wind park providing clean energy to the northern grid.', yearBuilt:2014, operator:'Energa' },
  { id:'w5', name:'Darłowo Offshore Wind', type:'wind', lat:54.53, lng:16.35, capacityMW:350, baseEfficiency:85, weatherSensitivity:{wind:0.97,sun:0,rain:0.03}, province:'zachodniopomorskie', description:'Offshore wind farm in the Baltic Sea.', yearBuilt:2025, operator:'PGE Baltica' },
  { id:'w6', name:'Suwałki Wind Park', type:'wind', lat:54.1, lng:22.93, capacityMW:45, baseEfficiency:68, weatherSensitivity:{wind:0.88,sun:0,rain:0.10}, province:'podlaskie', description:'Northeastern wind installation.', yearBuilt:2018, operator:'Tauron' },
  { id:'w7', name:'Resko Wind Farm', type:'wind', lat:53.77, lng:15.42, capacityMW:76, baseEfficiency:75, weatherSensitivity:{wind:0.91,sun:0,rain:0.06}, province:'zachodniopomorskie', description:'Western Pomeranian wind installation.', yearBuilt:2016, operator:'Iberdrola' },
  // SOLAR
  { id:'s1', name:'Witnica Solar Park', type:'solar', lat:52.67, lng:14.92, capacityMW:64, baseEfficiency:82, weatherSensitivity:{wind:0,sun:0.95,rain:0.30}, province:'lubuskie', description:'Poland\'s largest PV installation covering 120 hectares.', yearBuilt:2021, operator:'Esoleo' },
  { id:'s2', name:'Brudzew Solar Farm', type:'solar', lat:51.77, lng:18.44, capacityMW:70, baseEfficiency:80, weatherSensitivity:{wind:0,sun:0.93,rain:0.28}, province:'wielkopolskie', description:'Major solar installation with bifacial panels.', yearBuilt:2022, operator:'PAK PCE' },
  { id:'s3', name:'Kleczew Solar Plant', type:'solar', lat:52.08, lng:18.22, capacityMW:40, baseEfficiency:78, weatherSensitivity:{wind:0,sun:0.92,rain:0.25}, province:'wielkopolskie', description:'Built on reclaimed mining land.', yearBuilt:2023, operator:'ZE PAK' },
  { id:'s4', name:'Tarnów Solar Farm', type:'solar', lat:50.01, lng:20.99, capacityMW:30, baseEfficiency:76, weatherSensitivity:{wind:0,sun:0.90,rain:0.27}, province:'małopolskie', description:'Solar farm with tracking panels.', yearBuilt:2022, operator:'Tauron' },
  { id:'s5', name:'Lublin Solar Park', type:'solar', lat:51.28, lng:22.56, capacityMW:55, baseEfficiency:79, weatherSensitivity:{wind:0,sun:0.91,rain:0.26}, province:'lubelskie', description:'Eastern Poland solar installation.', yearBuilt:2023, operator:'PGE' },
  { id:'s6', name:'Rzeszów Solar Array', type:'solar', lat:50.09, lng:22.01, capacityMW:25, baseEfficiency:75, weatherSensitivity:{wind:0,sun:0.89,rain:0.30}, province:'podkarpackie', description:'Subcarpathian solar installation.', yearBuilt:2021, operator:'PGE' },
  // COAL
  { id:'c1', name:'Bełchatów Power Station', type:'coal', lat:51.264, lng:19.325, capacityMW:5420, baseEfficiency:88, weatherSensitivity:{wind:0,sun:0,rain:0.02}, province:'łódzkie', description:'Europe\'s largest lignite-fired power station.', yearBuilt:1982, operator:'PGE' },
  { id:'c2', name:'Kozienice Power Plant', type:'coal', lat:51.58, lng:21.54, capacityMW:4000, baseEfficiency:86, weatherSensitivity:{wind:0,sun:0,rain:0.02}, province:'mazowieckie', description:'Major hard coal plant near Warsaw.', yearBuilt:1972, operator:'Enea' },
  { id:'c3', name:'Łaziska Power Plant', type:'coal', lat:50.14, lng:18.85, capacityMW:1155, baseEfficiency:82, weatherSensitivity:{wind:0,sun:0,rain:0.02}, province:'śląskie', description:'Silesian coal-fired plant.', yearBuilt:1967, operator:'Tauron' },
  { id:'c4', name:'Opole Power Plant', type:'coal', lat:50.70, lng:17.92, capacityMW:3532, baseEfficiency:90, weatherSensitivity:{wind:0,sun:0,rain:0.01}, province:'opolskie', description:'Modern coal plant with supercritical units.', yearBuilt:1993, operator:'PGE' },
  { id:'c5', name:'Turów Power Plant', type:'coal', lat:50.92, lng:14.92, capacityMW:2106, baseEfficiency:84, weatherSensitivity:{wind:0,sun:0,rain:0.02}, province:'dolnośląskie', description:'Lignite plant near Czech and German borders.', yearBuilt:1962, operator:'PGE' },
  { id:'c6', name:'Rybnik Power Plant', type:'coal', lat:50.08, lng:18.56, capacityMW:1775, baseEfficiency:83, weatherSensitivity:{wind:0,sun:0,rain:0.02}, province:'śląskie', description:'Hard coal plant in the Silesian basin.', yearBuilt:1974, operator:'PGE' },
  // HYDRO
  { id:'h1', name:'Włocławek Hydropower', type:'hydro', lat:52.65, lng:19.06, capacityMW:162, baseEfficiency:90, weatherSensitivity:{wind:0,sun:0,rain:0.40}, province:'kujawsko-pomorskie', description:'Largest run-of-river plant on the Vistula.', yearBuilt:1970, operator:'Energa' },
  { id:'h2', name:'Solina Dam', type:'hydro', lat:49.37, lng:22.45, capacityMW:200, baseEfficiency:92, weatherSensitivity:{wind:0,sun:0,rain:0.45}, province:'podkarpackie', description:'Tallest dam in Poland, pumped-storage.', yearBuilt:1968, operator:'PGE' },
  { id:'h3', name:'Żarnowiec Pumped Storage', type:'hydro', lat:54.77, lng:18.08, capacityMW:716, baseEfficiency:94, weatherSensitivity:{wind:0,sun:0,rain:0.35}, province:'pomorskie', description:'Poland\'s largest pumped-storage plant.', yearBuilt:1983, operator:'PGE' },
  { id:'h4', name:'Porąbka-Żar Pumped Storage', type:'hydro', lat:49.77, lng:19.25, capacityMW:500, baseEfficiency:91, weatherSensitivity:{wind:0,sun:0,rain:0.38}, province:'śląskie', description:'Underground pumped-storage in the Beskids.', yearBuilt:1979, operator:'PGE' },
  { id:'h5', name:'Dychów Hydropower', type:'hydro', lat:51.89, lng:15.15, capacityMW:90, baseEfficiency:88, weatherSensitivity:{wind:0,sun:0,rain:0.42}, province:'lubuskie', description:'Run-of-river on the Bóbr River.', yearBuilt:1936, operator:'Enea' },
  // STORAGE
  { id:'st1', name:'Żarnowiec Battery Storage', type:'storage', lat:54.78, lng:18.06, capacityMW:200, baseEfficiency:95, weatherSensitivity:{wind:0,sun:0,rain:0}, province:'pomorskie', description:'Utility-scale lithium-ion battery storage.', yearBuilt:2024, operator:'PGE' },
  { id:'st2', name:'Bełchatów Grid Storage', type:'storage', lat:51.28, lng:19.35, capacityMW:150, baseEfficiency:93, weatherSensitivity:{wind:0,sun:0,rain:0}, province:'łódzkie', description:'Large-scale battery for grid regulation.', yearBuilt:2025, operator:'PGE' },
  { id:'st3', name:'Gdańsk Energy Hub', type:'storage', lat:54.34, lng:18.64, capacityMW:100, baseEfficiency:94, weatherSensitivity:{wind:0,sun:0,rain:0}, province:'pomorskie', description:'Smart grid storage for Tri-City area.', yearBuilt:2024, operator:'Energa' },
  { id:'st4', name:'Katowice Battery Park', type:'storage', lat:50.26, lng:19.02, capacityMW:80, baseEfficiency:92, weatherSensitivity:{wind:0,sun:0,rain:0}, province:'śląskie', description:'Urban battery supporting industrial grid.', yearBuilt:2025, operator:'Tauron' },
  // BIOMASS
  { id:'b1', name:'Konin Biomass Plant', type:'biomass', lat:52.23, lng:18.25, capacityMW:50, baseEfficiency:74, weatherSensitivity:{wind:0,sun:0,rain:0.05}, province:'wielkopolskie', description:'Converted from coal to biomass.', yearBuilt:2015, operator:'ZE PAK' },
  { id:'b2', name:'Połaniec Green Unit', type:'biomass', lat:50.43, lng:21.28, capacityMW:225, baseEfficiency:76, weatherSensitivity:{wind:0,sun:0,rain:0.04}, province:'świętokrzyskie', description:'World\'s largest dedicated biomass unit at 225 MW.', yearBuilt:2012, operator:'Enea' },
  { id:'b3', name:'Białystok CHP Biomass', type:'biomass', lat:53.15, lng:23.16, capacityMW:35, baseEfficiency:72, weatherSensitivity:{wind:0,sun:0,rain:0.06}, province:'podlaskie', description:'CHP plant using local forestry residues.', yearBuilt:2017, operator:'Enea' },
  { id:'b4', name:'Szczecin Biomass CHP', type:'biomass', lat:53.42, lng:14.57, capacityMW:42, baseEfficiency:73, weatherSensitivity:{wind:0,sun:0,rain:0.05}, province:'zachodniopomorskie', description:'City-integrated biomass with district heating.', yearBuilt:2019, operator:'PGE' },
  // HOUSES
  { id:'r1', name:'Warsaw Praga District', type:'house', lat:52.26, lng:21.04, capacityMW:0, baseEfficiency:65, weatherSensitivity:{wind:0.15,sun:0.10,rain:0}, province:'mazowieckie', description:'Mixed old and modern housing stock.' },
  { id:'r2', name:'Kraków Nowa Huta', type:'house', lat:50.07, lng:20.05, capacityMW:0, baseEfficiency:55, weatherSensitivity:{wind:0.12,sun:0.08,rain:0}, province:'małopolskie', description:'Historic area undergoing energy modernization.' },
  { id:'r3', name:'Gdańsk Oliwa', type:'house', lat:54.41, lng:18.57, capacityMW:0, baseEfficiency:72, weatherSensitivity:{wind:0.18,sun:0.12,rain:0}, province:'pomorskie', description:'Modern eco-district with heat pumps.' },
  { id:'r4', name:'Wrocław Krzyki', type:'house', lat:51.08, lng:17.02, capacityMW:0, baseEfficiency:60, weatherSensitivity:{wind:0.14,sun:0.10,rain:0}, province:'dolnośląskie', description:'Mixed residential with thermal modernization.' },
  { id:'r5', name:'Poznań Rataje', type:'house', lat:52.39, lng:16.96, capacityMW:0, baseEfficiency:68, weatherSensitivity:{wind:0.13,sun:0.09,rain:0}, province:'wielkopolskie', description:'Dense neighbourhood with smart meters.' },
  { id:'r6', name:'Katowice Ligota', type:'house', lat:50.23, lng:18.96, capacityMW:0, baseEfficiency:52, weatherSensitivity:{wind:0.10,sun:0.08,rain:0}, province:'śląskie', description:'Transitioning away from coal heating.' },
  { id:'r7', name:'Łódź Bałuty', type:'house', lat:51.79, lng:19.45, capacityMW:0, baseEfficiency:48, weatherSensitivity:{wind:0.11,sun:0.09,rain:0}, province:'łódzkie', description:'Energy renovation projects underway.' },
  { id:'r8', name:'Lublin Czuby', type:'house', lat:51.22, lng:22.54, capacityMW:0, baseEfficiency:62, weatherSensitivity:{wind:0.12,sun:0.10,rain:0}, province:'lubelskie', description:'Recent insulation upgrades completed.' },
];

// ===== PROCEDURAL FACILITY GENERATOR =====
const PROVINCES_GEO: Record<string, { latMin: number; latMax: number; lngMin: number; lngMax: number }> = {
  'dolnośląskie':        { latMin: 50.65, latMax: 51.35, lngMin: 15.45, lngMax: 17.10 },
  'kujawsko-pomorskie':  { latMin: 52.65, latMax: 53.45, lngMin: 17.80, lngMax: 19.30 },
  'lubelskie':           { latMin: 50.85, latMax: 51.80, lngMin: 22.00, lngMax: 23.40 },
  'lubuskie':            { latMin: 51.70, latMax: 52.55, lngMin: 14.75, lngMax: 15.70 },
  'łódzkie':             { latMin: 51.35, latMax: 52.05, lngMin: 18.80, lngMax: 20.20 },
  'małopolskie':         { latMin: 49.60, latMax: 50.25, lngMin: 19.50, lngMax: 20.90 },
  'mazowieckie':         { latMin: 51.65, latMax: 52.75, lngMin: 19.80, lngMax: 21.60 },
  'opolskie':            { latMin: 50.30, latMax: 50.85, lngMin: 17.40, lngMax: 18.30 },
  'podkarpackie':        { latMin: 49.50, latMax: 50.15, lngMin: 21.70, lngMax: 22.80 },
  'podlaskie':           { latMin: 53.00, latMax: 54.00, lngMin: 22.30, lngMax: 23.50 },
  'pomorskie':           { latMin: 53.95, latMax: 54.55, lngMin: 17.40, lngMax: 19.00 },
  'śląskie':             { latMin: 49.85, latMax: 50.50, lngMin: 18.50, lngMax: 19.55 },
  'świętokrzyskie':      { latMin: 50.50, latMax: 51.00, lngMin: 20.20, lngMax: 21.20 },
  'warmińsko-mazurskie': { latMin: 53.50, latMax: 54.25, lngMin: 19.80, lngMax: 21.60 },
  'wielkopolskie':       { latMin: 51.65, latMax: 52.60, lngMin: 16.30, lngMax: 18.20 },
  'zachodniopomorskie':  { latMin: 53.40, latMax: 54.20, lngMin: 14.50, lngMax: 16.20 },
};

const WIND_NAMES = ['Northwind','Zephyr','Gale','Breeze','Mistral','Tramontane','Bora','Sirocco','Halcyon','Vortex','Cyclone','Aurora','Boreas','Aquilo'];
const SOLAR_NAMES = ['Helios','Solaris','Sunridge','Photon','Daybreak','Lumina','Radiant','Zenith','Apex','Corona','Horizon'];
const COAL_NAMES = ['Termika','Energia','Cieplna','Wytwórcza','Centrale'];
const HYDRO_NAMES = ['Wodospad','Rzeka','Potok','Kaskada','Zapora','Nurt'];
const STORAGE_NAMES = ['PowerVault','GridBank','FlexStore','VoltCache','AmpReserve'];
const BIOMASS_NAMES = ['BioGreen','EcoFuel','GreenHeat','Woodchip','AgriPower'];
const HOUSE_NAMES = ['Osiedle','Dzielnica','Kwartał','Bloki','Zabudowa'];
const TOWN_SUFFIXES = ['owo','ów','ice','ek','no','ino','in','ów Wielki','ów Mały','ówek'];

function seededRand(seed: number): number {
  let s = (seed * 16807 + 12345) % 2147483647;
  return (s & 0x7fffffff) / 2147483647;
}

function generateFacilities(): EnergyFacility[] {
  const generated: EnergyFacility[] = [];
  const provinces = Object.keys(PROVINCES_GEO);
  const types: FacilityType[] = ['wind','wind','solar','solar','coal','hydro','storage','biomass','house','house','wind','solar'];
  let id = 100;

  for (let i = 0; i < 180; i++) {
    const seed = i * 7919 + 42;
    const r1 = seededRand(seed); const r2 = seededRand(seed + 1); const r3 = seededRand(seed + 2);
    const r4 = seededRand(seed + 3); const r5 = seededRand(seed + 4); const r6 = seededRand(seed + 5);

    const province = provinces[Math.floor(r1 * provinces.length)];
    const geo = PROVINCES_GEO[province];
    const type = types[Math.floor(r2 * types.length)];
    const lat = Math.round((geo.latMin + r3 * (geo.latMax - geo.latMin)) * 1000) / 1000;
    const lng = Math.round((geo.lngMin + r4 * (geo.lngMax - geo.lngMin)) * 1000) / 1000;

    let name: string, cap: number, eff: number, ws: EnergyFacility['weatherSensitivity'], desc: string;
    const suffix = TOWN_SUFFIXES[Math.floor(r5 * TOWN_SUFFIXES.length)];

    switch (type) {
      case 'wind': {
        const n = WIND_NAMES[Math.floor(r6 * WIND_NAMES.length)];
        name = `${n} ${suffix}`; cap = Math.round(15 + r5 * 180); eff = Math.round(65 + r6 * 20);
        ws = { wind: 0.85 + r6 * 0.12, sun: 0, rain: 0.03 + r5 * 0.07 };
        desc = `Wind farm with ${Math.round(cap / 3)} turbines.`;
        break;
      }
      case 'solar': {
        const n = SOLAR_NAMES[Math.floor(r6 * SOLAR_NAMES.length)];
        name = `${n} ${suffix}`; cap = Math.round(5 + r5 * 80); eff = Math.round(70 + r6 * 18);
        ws = { wind: 0, sun: 0.85 + r6 * 0.12, rain: 0.15 + r5 * 0.20 };
        desc = `Solar installation covering ${Math.round(cap * 1.8)} hectares.`;
        break;
      }
      case 'coal': {
        const n = COAL_NAMES[Math.floor(r6 * COAL_NAMES.length)];
        name = `EC ${n} ${suffix}`; cap = Math.round(200 + r5 * 2000); eff = Math.round(78 + r6 * 14);
        ws = { wind: 0, sun: 0, rain: 0.01 + r5 * 0.02 };
        desc = `Thermal power plant.`;
        break;
      }
      case 'hydro': {
        const n = HYDRO_NAMES[Math.floor(r6 * HYDRO_NAMES.length)];
        name = `${n} ${suffix}`; cap = Math.round(10 + r5 * 150); eff = Math.round(82 + r6 * 14);
        ws = { wind: 0, sun: 0, rain: 0.30 + r5 * 0.20 };
        desc = `Hydroelectric plant on local river.`;
        break;
      }
      case 'storage': {
        const n = STORAGE_NAMES[Math.floor(r6 * STORAGE_NAMES.length)];
        name = `${n} ${suffix}`; cap = Math.round(20 + r5 * 120); eff = Math.round(90 + r6 * 8);
        ws = { wind: 0, sun: 0, rain: 0 };
        desc = `Grid-scale battery storage facility.`;
        break;
      }
      case 'biomass': {
        const n = BIOMASS_NAMES[Math.floor(r6 * BIOMASS_NAMES.length)];
        name = `${n} ${suffix}`; cap = Math.round(5 + r5 * 60); eff = Math.round(68 + r6 * 14);
        ws = { wind: 0, sun: 0, rain: 0.02 + r5 * 0.06 };
        desc = `Biomass energy from agricultural waste.`;
        break;
      }
      default: { // house
        const n = HOUSE_NAMES[Math.floor(r6 * HOUSE_NAMES.length)];
        name = `${n} ${suffix}`; cap = 0; eff = Math.round(40 + r6 * 40);
        ws = { wind: 0.08 + r5 * 0.12, sun: 0.05 + r6 * 0.10, rain: 0 };
        desc = `Residential area with ${Math.round(200 + r5 * 2000)} households.`;
        break;
      }
    }

    generated.push({
      id: `g${id++}`, name, type, lat, lng, capacityMW: cap, baseEfficiency: eff,
      weatherSensitivity: ws, province, description: desc,
    });
  }

  // === SECOND PASS: ensure at least 5 per province ===
  const allSoFar = [...ENERGY_FACILITIES, ...generated];
  const countPerProvince: Record<string, number> = {};
  for (const f of allSoFar) countPerProvince[f.province] = (countPerProvince[f.province] || 0) + 1;

  for (const province of Object.keys(PROVINCES_GEO)) {
    const have = countPerProvince[province] || 0;
    const need = Math.max(0, 5 - have);
    const geo = PROVINCES_GEO[province];
    const fillTypes: FacilityType[] = ['wind', 'solar', 'house', 'biomass', 'storage'];
    for (let j = 0; j < need; j++) {
      const s = id * 3571 + j * 9311;
      const r1 = seededRand(s); const r2 = seededRand(s + 1);
      const lat = Math.round((geo.latMin + r1 * (geo.latMax - geo.latMin)) * 1000) / 1000;
      const lng = Math.round((geo.lngMin + r2 * (geo.lngMax - geo.lngMin)) * 1000) / 1000;
      const ft = fillTypes[j % fillTypes.length];
      const suffix = TOWN_SUFFIXES[j % TOWN_SUFFIXES.length];
      const cap = ft === 'house' ? 0 : Math.round(10 + r1 * 80);
      generated.push({
        id: `g${id++}`, name: `${ft === 'house' ? 'Osiedle' : ft === 'wind' ? 'Wiatraki' : ft === 'solar' ? 'Farma PV' : ft === 'biomass' ? 'BioEko' : 'MagazynE'} ${suffix}`,
        type: ft, lat, lng, capacityMW: cap, baseEfficiency: Math.round(55 + r2 * 30),
        weatherSensitivity: ft === 'wind' ? { wind: 0.9, sun: 0, rain: 0.05 } : ft === 'solar' ? { wind: 0, sun: 0.9, rain: 0.2 } : { wind: 0.1, sun: 0.1, rain: 0 },
        province, description: `Local ${ft} installation.`,
      });
    }
  }

  return generated;
}

// Merge hand-crafted + generated
ENERGY_FACILITIES.push(...generateFacilities());
