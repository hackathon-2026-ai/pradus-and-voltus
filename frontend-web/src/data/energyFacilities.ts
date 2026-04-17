// ===== ENERGY FACILITY TYPES & DATA =====
export type FacilityType = 'wind' | 'solar' | 'coal' | 'hydro' | 'storage' | 'biomass' | 'house';

export interface EnergyFacility {
  id: string;
  name: string;
  type: FacilityType;
  lat: number;
  lng: number;
  capacityMW: number;
  baseEfficiency: number;
  weatherSensitivity: { wind: number; sun: number; rain: number; };
  province: string;
  description: string;
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
