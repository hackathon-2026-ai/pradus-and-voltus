export type Language = 'pl' | 'en';

type Translations = Record<string, Record<Language, string>>;

export const translations: Translations = {
  // === TopBar ===
  'topbar.title': { pl: 'Interaktywna Mapa Polski', en: 'Interactive Map of Poland' },
  'topbar.breadcrumb': { pl: 'Panel › Widok mapy', en: 'Dashboard › Map View' },
  'topbar.search': { pl: 'Szukaj regionu...', en: 'Search region...' },
  'topbar.tileToggle': { pl: 'Zmień styl mapy', en: 'Switch map style' },

  // === Sidebar ===
  'nav.mapView': { pl: 'Widok mapy', en: 'Map View' },
  'nav.analytics': { pl: 'Analityka', en: 'Analytics' },
  'nav.compare': { pl: 'Porównanie', en: 'Compare' },
  'nav.zoom': { pl: 'Przybliżenie', en: 'Zoom' },
  'nav.aiChat': { pl: 'Czat AI', en: 'AI Chat' },
  'nav.flyToPoland': { pl: 'Leć do Polski', en: 'Fly to Poland' },
  'nav.settings': { pl: 'Ustawienia', en: 'Settings' },
  'nav.expandSidebar': { pl: 'Rozwiń panel boczny', en: 'Expand sidebar' },
  'nav.collapseSidebar': { pl: 'Zwiń panel boczny', en: 'Collapse sidebar' },

  // === Settings ===
  'settings.title': { pl: 'Ustawienia', en: 'Settings' },
  'settings.theme': { pl: 'Motyw', en: 'Theme' },
  'settings.language': { pl: 'Język', en: 'Language' },
  'settings.switchToLight': { pl: 'Przełącz na tryb jasny', en: 'Switch to light mode' },
  'settings.switchToDark': { pl: 'Przełącz na tryb ciemny', en: 'Switch to dark mode' },
  'settings.model': { pl: 'Model AI', en: 'AI Model' },
  'settings.modelLocal': { pl: 'Lokalny', en: 'Local' },
  'settings.modelCloud': { pl: 'Chmurowy', en: 'Cloud' },
  'settings.modelDataTitle': { pl: 'Dane i prywatność', en: 'Data & privacy' },
  'settings.modelDataLocal': {
    pl: 'Model lokalny (zalecany): przetwarzanie odbywa się na urządzeniu — zapytania pozostają na urządzeniu.',
    en: 'Local model (recommended): processing happens on your device — prompts stay on-device.',
  },
  'settings.modelDataCloud': {
    pl: 'Model chmurowy: zapytania są przesyłane do usługi w chmurze w celu przetworzenia — nie podawaj danych wrażliwych.',
    en: 'Cloud model: prompts are sent to a cloud service for processing — avoid sharing sensitive data.',
  },

  // === ChatPanel ===
  'chat.thinking': { pl: 'Myślę...', en: 'Thinking...' },
  'chat.ready': { pl: 'Gotowy', en: 'Ready' },
  'chat.shrink': { pl: 'Zmniejsz czat', en: 'Shrink chat' },
  'chat.expand': { pl: 'Powiększ czat', en: 'Expand chat' },
  'chat.welcome': { pl: 'Zapytaj mnie o dane energetyczne, obiekty lub regiony na mapie.', en: 'Ask me anything about energy data, facilities, or regions on the map.' },
  'chat.suggestion1': { pl: 'Jaka jest całkowita moc energetyczna?', en: "What's the total energy capacity?" },
  'chat.suggestion2': { pl: 'Porównaj produkcję wiatru i słońca', en: 'Compare wind vs solar output' },
  'chat.suggestion3': { pl: 'Które województwo zużywa najwięcej energii?', en: 'Which province uses the most energy?' },
  'chat.placeholder': { pl: 'Zapytaj o dane energetyczne...', en: 'Ask about energy data...' },
  'chat.poweredBy': { pl: 'Napędzany przez Voltuś AI', en: 'Powered by Voltuś AI' },
  'chat.response1': {
    pl: 'Na podstawie aktualnych warunków pogodowych farmy wiatrowe pracują z wydajnością około 72%. Najwyższa produkcja jest w województwie pomorskim.',
    en: 'Based on current weather conditions, wind farms are operating at approximately 72% efficiency. The strongest output is in the Pomerania region.',
  },
  'chat.response2': {
    pl: 'Całkowita zainstalowana moc w Polsce we wszystkich monitorowanych obiektach wynosi około 24 000 MW. Węgiel nadal stanowi największy udział — ok. 60%.',
    en: "Poland's total installed capacity across all tracked facilities is approximately 24,000 MW. Coal still represents the largest share at ~60%.",
  },
  'chat.response3': {
    pl: 'Województwo śląskie ma najwyższe zużycie energii ze względu na bazę przemysłową, ze średnim współczynnikiem obciążenia na poziomie 78%.',
    en: 'The Silesian voivodeship has the highest energy consumption due to its industrial base, with current load factors averaging 78%.',
  },
  'chat.response4': {
    pl: 'Farmy fotowoltaiczne osiągają dziś dobre wyniki — indeks nasłonecznienia wynosi 0,65. Farma Solarna Witnica w woj. lubuskim produkuje 52 MW.',
    en: 'Solar parks are performing well today with sunshine index at 0.65. The Witnica Solar Park in Lubuskie is producing 52 MW.',
  },
  'chat.response5': {
    pl: 'Magazyny energii są aktualnie naładowane w 89%. Magazyn Żarnowiec prowadzi z dostępną mocą 200 MW.',
    en: 'Energy storage facilities are currently at 89% charge capacity. The Żarnowiec Battery Storage leads with 200 MW available.',
  },
  'chat.response6': {
    pl: 'Porównanie wiatru i słońca: farmy wiatrowe średnio 74% wydajności dzięki umiarkowanym wiatrom, a farmy solarne średnio 68% przy częściowym zachmurzeniu.',
    en: 'Comparing wind vs solar: wind farms average 74% efficiency today due to moderate winds, while solar parks average 68% under partial cloud cover.',
  },

  // === Faceplate — facility mode ===
  'faceplate.back': { pl: 'Wróć', en: 'Back' },
  'faceplate.live': { pl: 'NA ŻYWO', en: 'LIVE' },
  'faceplate.operator': { pl: 'Operator:', en: 'Operated by' },
  'faceplate.since': { pl: 'Od', en: 'Since' },
  'faceplate.consumption': { pl: 'Zużycie', en: 'Consumption' },
  'faceplate.monthlyBill': { pl: 'Rachunek miesięczny', en: 'Monthly Bill' },
  'faceplate.efficiency': { pl: 'Wydajność', en: 'Efficiency' },
  'faceplate.weatherImpact': { pl: 'Wpływ pogody', en: 'Weather Impact' },
  'faceplate.currentOutput': { pl: 'Aktualna produkcja', en: 'Current Output' },
  'faceplate.capacity': { pl: 'Moc zainstalowana', en: 'Capacity' },
  'faceplate.dailyOutput': { pl: 'Produkcja dzienna', en: 'Daily Output' },
  'faceplate.energyRating': { pl: 'Klasa energetyczna', en: 'Energy Rating' },
  'faceplate.co2Footprint': { pl: 'Ślad CO₂', en: 'CO₂ Footprint' },
  'faceplate.baseEfficiency': { pl: 'Wydajność bazowa', en: 'Base Efficiency' },
  'faceplate.gridSupply': { pl: 'Zasilanie z sieci', en: 'Grid Supply' },
  'faceplate.connected': { pl: 'Podłączony', en: 'Connected' },
  'faceplate.gridShare': { pl: 'Udział w sieci', en: 'Grid Share' },
  'faceplate.co2Emitted': { pl: 'Emisja CO₂', en: 'CO₂ Emitted' },
  'faceplate.co2Avoided': { pl: 'Uniknięte CO₂', en: 'CO₂ Avoided' },
  'faceplate.costPerMwh': { pl: 'Koszt/MWh', en: 'Cost/MWh' },
  'faceplate.yearBuilt': { pl: 'Rok budowy', en: 'Year Built' },
  'faceplate.na': { pl: 'N/D', en: 'N/A' },
  'faceplate.tPerDay': { pl: 't/dzień', en: 't/day' },
  'faceplate.efficiencyRatingTitle': { pl: 'Klasa efektywności energetycznej', en: 'Energy Efficiency Rating' },
  'faceplate.efficiencyRatingSubtitle': { pl: 'Na podstawie izolacji, systemu grzewczego i reakcji na pogodę', en: 'Based on insulation, heating system & weather response' },
  'faceplate.nearbySuppliers': { pl: 'Pobliskie źródła energii', en: 'Nearby Energy Suppliers' },

  // === Faceplate — region mode ===
  'faceplate.currentUsage': { pl: 'Aktualne zużycie', en: 'Current Usage' },
  'faceplate.totalCapacity': { pl: 'Całkowita moc', en: 'Total Capacity' },
  'faceplate.availableEnergy': { pl: 'Dostępna energia', en: 'Available Energy' },
  'faceplate.loadFactor': { pl: 'Współczynnik obciążenia', en: 'Load Factor' },
  'faceplate.gridStability': { pl: 'Stabilność sieci', en: 'Grid Stability' },
  'faceplate.renewableShare': { pl: 'Udział OZE', en: 'Renewable Share' },
  'faceplate.reserveMargin': { pl: 'Margines rezerwy', en: 'Reserve Margin' },
  'faceplate.available': { pl: 'Dostępna', en: 'Available' },
  'faceplate.counties': { pl: 'Powiaty', en: 'Counties' },
  'faceplate.countyDetails': { pl: 'Szczegóły powiatu', en: 'County Details' },
  'faceplate.backToProvinces': { pl: 'Wróć do województw', en: 'Back to provinces' },

  // === Weather gauges ===
  'weather.wind': { pl: 'Wiatr', en: 'Wind' },
  'weather.sunshine': { pl: 'Słońce', en: 'Sunshine' },
  'weather.rain': { pl: 'Deszcz', en: 'Rain' },
  'weather.temp': { pl: 'Temp.', en: 'Temp' },

  // === Map tooltips ===
  'map.mwUsed': { pl: 'MW zuż.', en: 'MW used' },
  'map.mwCap': { pl: 'MW moc', en: 'MW cap' },
  'map.load': { pl: 'obciąż.', en: 'load' },
  'map.green': { pl: 'OZE', en: 'green' },
  'map.counties': { pl: 'powiatów', en: 'counties' },

  // === App.tsx subtitles ===
  'app.province': { pl: 'Województwo', en: 'Province' },
  'app.county': { pl: 'Powiat', en: 'County' },
};

// === Facility type labels (bilingual) ===
export const facilityTypeLabels: Record<string, Record<Language, string>> = {
  wind:    { pl: 'Farma wiatrowa',       en: 'Wind Farm' },
  solar:   { pl: 'Farma fotowoltaiczna', en: 'Solar Park' },
  coal:    { pl: 'Elektrownia węglowa',  en: 'Coal Power Plant' },
  hydro:   { pl: 'Elektrownia wodna',    en: 'Hydroelectric' },
  storage: { pl: 'Magazyn energii',      en: 'Energy Storage' },
  biomass: { pl: 'Elektrownia na biomasę', en: 'Biomass Plant' },
  house:   { pl: 'Obszar mieszkalny',    en: 'Residential Area' },
};

// === Province names (bilingual) ===
export const provinceNames: Record<string, Record<Language, string>> = {
  'śląskie':              { pl: 'Śląskie',              en: 'Silesia' },
  'opolskie':             { pl: 'Opolskie',             en: 'Opole' },
  'wielkopolskie':        { pl: 'Wielkopolskie',        en: 'Greater Poland' },
  'zachodniopomorskie':   { pl: 'Zachodniopomorskie',   en: 'West Pomerania' },
  'świętokrzyskie':      { pl: 'Świętokrzyskie',      en: 'Holy Cross' },
  'kujawsko-pomorskie':  { pl: 'Kujawsko-pomorskie',  en: 'Kuyavia-Pomerania' },
  'podlaskie':            { pl: 'Podlaskie',            en: 'Podlasie' },
  'dolnośląskie':        { pl: 'Dolnośląskie',        en: 'Lower Silesia' },
  'podkarpackie':         { pl: 'Podkarpackie',         en: 'Subcarpathia' },
  'małopolskie':         { pl: 'Małopolskie',         en: 'Lesser Poland' },
  'pomorskie':            { pl: 'Pomorskie',            en: 'Pomerania' },
  'warmińsko-mazurskie': { pl: 'Warmińsko-mazurskie', en: 'Warmia-Masuria' },
  'łódzkie':             { pl: 'Łódzkie',             en: 'Łódź' },
  'mazowieckie':          { pl: 'Mazowieckie',          en: 'Masovia' },
  'lubelskie':            { pl: 'Lubelskie',            en: 'Lublin' },
  'lubuskie':             { pl: 'Lubuskie',             en: 'Lubusz' },
};

// === Weather condition labels (bilingual) ===
export const weatherConditionLabels: Record<string, Record<Language, string>> = {
  stormy:         { pl: 'Burzowo',               en: 'Stormy' },
  windy:          { pl: 'Wietrznie',              en: 'Windy' },
  rainy:          { pl: 'Deszczowo',              en: 'Rainy' },
  cloudy:         { pl: 'Pochmurno',              en: 'Overcast' },
  'partly-cloudy': { pl: 'Częściowe zachmurzenie', en: 'Partly Cloudy' },
  sunny:          { pl: 'Słonecznie',             en: 'Clear & Sunny' },
};

// === Weather explanation builders ===
export function getWeatherExplanation(
  type: string,
  weather: { windSpeed: number; sunshineIndex: number; temperature: number; rainProbability: number },
  weatherImpact: number,
  lang: Language,
): string {
  if (type === 'wind') {
    if (weather.windSpeed > 12)
      return lang === 'pl'
        ? `Silny wiatr (${weather.windSpeed} m/s) zwiększa produkcję o ${weatherImpact}%`
        : `Strong winds (${weather.windSpeed} m/s) boosting output by ${weatherImpact}%`;
    if (weather.windSpeed > 6)
      return lang === 'pl'
        ? `Umiarkowany wiatr (${weather.windSpeed} m/s) — dobre warunki`
        : `Moderate winds (${weather.windSpeed} m/s) — good conditions`;
    return lang === 'pl'
      ? `Słaby wiatr (${weather.windSpeed} m/s) zmniejsza produkcję`
      : `Low winds (${weather.windSpeed} m/s) reducing output`;
  }
  if (type === 'solar') {
    if (weather.sunshineIndex > 0.7)
      return lang === 'pl'
        ? `Intensywne nasłonecznienie zwiększa produkcję o ${weatherImpact}%`
        : `Bright sunshine boosting output by ${weatherImpact}%`;
    if (weather.sunshineIndex > 0.4)
      return lang === 'pl'
        ? `Częściowe zachmurzenie — umiarkowana produkcja`
        : `Partial cloud cover — moderate output`;
    return lang === 'pl'
      ? `Duże zachmurzenie zmniejsza generację solarną`
      : `Heavy cloud cover reducing solar generation`;
  }
  if (type === 'hydro') {
    if (weather.rainProbability > 0.5)
      return lang === 'pl'
        ? `Opady zwiększają przepływ wody — produkcja w górę o ${weatherImpact}%`
        : `Rainfall increasing water flow — output up ${weatherImpact}%`;
    return lang === 'pl'
      ? `Normalny poziom wody — stabilna generacja`
      : `Normal water levels — steady generation`;
  }
  if (type === 'coal')
    return lang === 'pl' ? 'Elektrownia cieplna — minimalna zależność od pogody' : 'Thermal plant — minimal weather dependency';
  if (type === 'storage')
    return lang === 'pl' ? 'Magazyn bateryjny — niezależny od pogody' : 'Battery storage — independent of weather';
  if (type === 'biomass')
    return lang === 'pl' ? 'Biomasa — stabilne dostawy paliwa, niewielki wpływ pogody' : 'Biomass — stable fuel supply, minor weather effects';
  if (type === 'house') {
    if (weather.temperature < 5)
      return lang === 'pl'
        ? `Zimno (${weather.temperature}°C) — duże zapotrzebowanie na ogrzewanie`
        : `Cold weather (${weather.temperature}°C) — high heating demand`;
    if (weather.temperature > 25)
      return lang === 'pl'
        ? `Upał (${weather.temperature}°C) — wzrost zapotrzebowania na chłodzenie`
        : `Hot weather (${weather.temperature}°C) — cooling demand up`;
    return lang === 'pl'
      ? `Łagodna pogoda (${weather.temperature}°C) — przeciętne zużycie`
      : `Mild weather (${weather.temperature}°C) — average consumption`;
  }
  return '';
}

// === Facility descriptions (bilingual) ===
export const facilityDescriptions: Record<string, Record<Language, string>> = {
  w1: { pl: 'Jedna z największych lądowych farm wiatrowych w Polsce z 80 turbinami.', en: "One of Poland's largest onshore wind farms with 80 turbines." },
  w2: { pl: 'Duża instalacja wiatrowa z 60 turbinami Vestas.', en: 'Major wind installation with 60 Vestas turbines.' },
  w3: { pl: 'Nadmorska farma wiatrowa korzystająca z bałtyckich wiatrów.', en: 'Coastal wind farm benefiting from Baltic breezes.' },
  w4: { pl: 'Park wiatrowy dostarczający czystą energię do sieci północnej.', en: 'Wind park providing clean energy to the northern grid.' },
  w5: { pl: 'Morska farma wiatrowa na Bałtyku.', en: 'Offshore wind farm in the Baltic Sea.' },
  w6: { pl: 'Północno-wschodnia instalacja wiatrowa.', en: 'Northeastern wind installation.' },
  w7: { pl: 'Zachodniopomorska instalacja wiatrowa.', en: 'Western Pomeranian wind installation.' },
  s1: { pl: 'Największa instalacja PV w Polsce na 120 hektarach.', en: "Poland's largest PV installation covering 120 hectares." },
  s2: { pl: 'Duża instalacja solarna z panelami dwustronnymi.', en: 'Major solar installation with bifacial panels.' },
  s3: { pl: 'Zbudowana na zrekultywowanym terenie pokopalniamym.', en: 'Built on reclaimed mining land.' },
  s4: { pl: 'Farma solarna z panelami śledzącymi słońce.', en: 'Solar farm with tracking panels.' },
  s5: { pl: 'Wschodniopolska instalacja solarna.', en: 'Eastern Poland solar installation.' },
  s6: { pl: 'Podkarpacka instalacja solarna.', en: 'Subcarpathian solar installation.' },
  c1: { pl: 'Największa elektrownia opalana węglem brunatnym w Europie.', en: "Europe's largest lignite-fired power station." },
  c2: { pl: 'Duża elektrownia węglowa w pobliżu Warszawy.', en: 'Major hard coal plant near Warsaw.' },
  c3: { pl: 'Śląska elektrownia węglowa.', en: 'Silesian coal-fired plant.' },
  c4: { pl: 'Nowoczesna elektrownia z blokami nadkrytycznymi.', en: 'Modern coal plant with supercritical units.' },
  c5: { pl: 'Elektrownia na węgiel brunatny przy granicy czeskiej i niemieckiej.', en: 'Lignite plant near Czech and German borders.' },
  c6: { pl: 'Elektrownia na węgiel kamienny w zagłębiu śląskim.', en: 'Hard coal plant in the Silesian basin.' },
  h1: { pl: 'Największa elektrownia przepływowa na Wiśle.', en: 'Largest run-of-river plant on the Vistula.' },
  h2: { pl: 'Najwyższa zapora w Polsce, elektrownia szczytowo-pompowa.', en: 'Tallest dam in Poland, pumped-storage.' },
  h3: { pl: 'Największa elektrownia szczytowo-pompowa w Polsce.', en: "Poland's largest pumped-storage plant." },
  h4: { pl: 'Podziemna elektrownia szczytowo-pompowa w Beskidach.', en: 'Underground pumped-storage in the Beskids.' },
  h5: { pl: 'Elektrownia przepływowa na rzece Bóbr.', en: 'Run-of-river on the Bóbr River.' },
  st1: { pl: 'Wielkoskalowy bateryjny magazyn energii litowo-jonowy.', en: 'Utility-scale lithium-ion battery storage.' },
  st2: { pl: 'Wielkoskalowy magazyn bateryjny do regulacji sieci.', en: 'Large-scale battery for grid regulation.' },
  st3: { pl: 'Inteligentny magazyn energii dla Trójmiasta.', en: 'Smart grid storage for Tri-City area.' },
  st4: { pl: 'Miejski magazyn bateryjny wspierający sieć przemysłową.', en: 'Urban battery supporting industrial grid.' },
  b1: { pl: 'Przekształcona z elektrowni węglowej na biomasową.', en: 'Converted from coal to biomass.' },
  b2: { pl: 'Największy na świecie dedykowany blok biomasowy o mocy 225 MW.', en: "World's largest dedicated biomass unit at 225 MW." },
  b3: { pl: 'Elektrociepłownia wykorzystująca lokalne odpady leśne.', en: 'CHP plant using local forestry residues.' },
  b4: { pl: 'Miejska elektrociepłownia biomasowa z ciepłownictwem.', en: 'City-integrated biomass with district heating.' },
  r1: { pl: 'Mieszana zabudowa stara i nowoczesna.', en: 'Mixed old and modern housing stock.' },
  r2: { pl: 'Historyczna dzielnica w trakcie modernizacji energetycznej.', en: 'Historic area undergoing energy modernization.' },
  r3: { pl: 'Nowoczesna ekodzielnica z pompami ciepła.', en: 'Modern eco-district with heat pumps.' },
  r4: { pl: 'Zabudowa mieszkaniowa z termomodernizacją.', en: 'Mixed residential with thermal modernization.' },
  r5: { pl: 'Gęsta zabudowa z inteligentnymi licznikami.', en: 'Dense neighbourhood with smart meters.' },
  r6: { pl: 'Dzielnica odchodząca od ogrzewania węglowego.', en: 'Transitioning away from coal heating.' },
  r7: { pl: 'Trwające projekty termomodernizacji.', en: 'Energy renovation projects underway.' },
  r8: { pl: 'Niedawno ukończono modernizację izolacji.', en: 'Recent insulation upgrades completed.' },
};

// === Procedural facility description builders ===
export function getProceduralDescription(type: string, cap: number, r5: number, lang: Language): string {
  switch (type) {
    case 'wind':
      return lang === 'pl'
        ? `Farma wiatrowa z ${Math.round(cap / 3)} turbinami.`
        : `Wind farm with ${Math.round(cap / 3)} turbines.`;
    case 'solar':
      return lang === 'pl'
        ? `Instalacja solarna na ${Math.round(cap * 1.8)} hektarach.`
        : `Solar installation covering ${Math.round(cap * 1.8)} hectares.`;
    case 'coal':
      return lang === 'pl' ? 'Elektrownia cieplna.' : 'Thermal power plant.';
    case 'hydro':
      return lang === 'pl' ? 'Elektrownia wodna na lokalnej rzece.' : 'Hydroelectric plant on local river.';
    case 'storage':
      return lang === 'pl' ? 'Wielkoskalowy bateryjny magazyn energii.' : 'Grid-scale battery storage facility.';
    case 'biomass':
      return lang === 'pl' ? 'Energia z biomasy z odpadów rolniczych.' : 'Biomass energy from agricultural waste.';
    default: // house
      return lang === 'pl'
        ? `Obszar mieszkalny z ${Math.round(200 + r5 * 2000)} gospodarstwami domowymi.`
        : `Residential area with ${Math.round(200 + r5 * 2000)} households.`;
  }
}

export function getLocalInstallationDesc(type: string, lang: Language): string {
  if (lang === 'pl') {
    const map: Record<string, string> = { wind: 'wiatrowa', solar: 'solarna', house: 'mieszkalna', biomass: 'biomasowa', storage: 'magazynowa' };
    return `Lokalna instalacja ${map[type] || type}.`;
  }
  return `Local ${type} installation.`;
}

export function getNearbyFallback(lang: Language): string {
  return lang === 'pl' ? 'Sieć regionalna' : 'Regional Grid';
}
