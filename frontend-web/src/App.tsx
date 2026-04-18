import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MapView, { type ViewMode } from './components/MapView';
import Faceplate from './components/Faceplate';
import ChatPanel from './components/ChatPanel';
import { PROVINCE_DATA } from './data/provinceData';
import { useTranslation } from './i18n/LanguageContext';
import { provinceNames } from './i18n/translations';
import {
  generateCountyEnergy,
  getCountiesForProvince,
  aggregateCountyData,
  type CountyFeatureCollection,
  type ProvinceFeatureCollection,
  type EnergyData,
  type CountyFeature,
} from './data/energyUtils';
import type { EnergyFacility } from './data/energyFacilities';

function App() {
  const { t, language } = useTranslation();
  // ===== STATE =====
  const [viewMode, setViewMode] = useState<ViewMode>('provinces');
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const [activeCounty, setActiveCounty] = useState<string | null>(null);
  const [activeTile, setActiveTile] = useState('dark');
  const [zoomLevel, setZoomLevel] = useState(6);
  const [activeSection, setActiveSection] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [flyTrigger, setFlyTrigger] = useState(0);

  // GeoJSON data
  const [provinceGeoData, setProvinceGeoData] = useState<ProvinceFeatureCollection | null>(null);
  const [countyGeoData, setCountyGeoData] = useState<CountyFeatureCollection | null>(null);

  // Faceplate state
  const [faceplateVisible, setFaceplateVisible] = useState(false);
  const [faceplateTitle, setFaceplateTitle] = useState('');
  const [faceplateSubtitle, setFaceplateSubtitle] = useState('');
  const [faceplateData, setFaceplateData] = useState<EnergyData | null>(null);
  const [faceplateCounties, setFaceplateCounties] = useState<CountyFeature[]>([]);
  const [faceplateShowCountyList, setFaceplateShowCountyList] = useState(true);

  // Facility state
  const [selectedFacility, setSelectedFacility] = useState<EnergyFacility | null>(null);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);

  // Resize state
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [faceplateWidth, setFaceplateWidth] = useState(380);

  // Theme & settings state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const handleThemeToggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setActiveTile(next === 'light' ? 'light' : 'dark');
      return next;
    });
  }, []);

  const handleSettingsToggle = useCallback(() => {
    setSettingsOpen(prev => !prev);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const handleChatToggle = useCallback(() => {
    setChatOpen(prev => !prev);
  }, []);

  const handleSidebarCollapseToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // ===== LOAD DATA =====
  useEffect(() => {
    const loadData = async () => {
      try {
        const [provResp, countyResp] = await Promise.all([
          fetch('/poland.geojson'),
          fetch('/powiaty.geojson'),
        ]);
        const provData = await provResp.json();
        const countyData = await countyResp.json();
        setCountyGeoData(countyData);
        setProvinceGeoData(provData);
      } catch (e) {
        console.error('Failed to load geo data:', e);
      }
    };
    loadData();
  }, []);

  // ===== CALLBACKS =====
  const handleProvinceClick = useCallback((
    provinceName: string,
    data: EnergyData,
    counties: CountyFeature[],
    _bounds: L.LatLngBounds,
  ) => {
    const pData = PROVINCE_DATA[provinceName];
    if (!pData) return;

    setActiveProvince(provinceName);
    setActiveCounty(null);
    setViewMode('counties');
    setSelectedFacility(null);

    setFaceplateTitle(provinceNames[provinceName]?.[language] ?? pData.nameEN);
    setFaceplateSubtitle(`${t('app.province')} · ${counties.length} ${t('map.counties')}`);
    setFaceplateData(data);
    setFaceplateCounties(counties);
    setFaceplateShowCountyList(true);
    setFaceplateVisible(true);
  }, [language, t]);

  const handleCountyClick = useCallback((countyName: string, data: EnergyData, provinceName: string) => {
    setActiveCounty(countyName);
    setSelectedFacility(null);
    const displayName = countyName.replace('powiat ', '');
    const pData = PROVINCE_DATA[provinceName];
    setFaceplateTitle(displayName);
    setFaceplateSubtitle(`${t('app.county')} · ${pData ? (provinceNames[provinceName]?.[language] ?? pData.nameEN) : ''}`);
    setFaceplateData(data);
    setFaceplateCounties([]);
    setFaceplateShowCountyList(false);
    setFaceplateVisible(true);
  }, [language, t]);

  const handleCountyClickFromList = useCallback((countyName: string) => {
    if (!activeProvince) return;
    const d = generateCountyEnergy(countyName, activeProvince!);
    handleCountyClick(countyName, d, activeProvince);
  }, [activeProvince, handleCountyClick]);

  const handleFacilityClick = useCallback((facility: EnergyFacility) => {
    setSelectedFacility(facility);
    setActiveCounty(null);
    setFaceplateVisible(true);
  }, []);

  const closeFaceplate = useCallback(() => {
    setFaceplateVisible(false);
    setActiveCounty(null);
    setSelectedFacility(null);
  }, []);

  const backToProvinces = useCallback(() => {
    setViewMode('provinces');
    setActiveProvince(null);
    setActiveCounty(null);
    setSelectedFacility(null);
    setFaceplateVisible(false);
    setFlyTrigger(t => t + 1);
  }, []);

  const handleBackFromFacility = useCallback(() => {
    if (selectedFacility) {
      // Go back from facility to whatever view we were in
      setSelectedFacility(null);
      if (activeProvince) {
        // Re-show province data
        const counties = getCountiesForProvince(countyGeoData, activeProvince);
        const agg = aggregateCountyData(counties);
        const pData = PROVINCE_DATA[activeProvince];
        if (pData) {
          setFaceplateTitle(provinceNames[activeProvince]?.[language] ?? pData.nameEN);
          setFaceplateSubtitle(`${t('app.province')} · ${counties.length} ${t('map.counties')}`);
          setFaceplateData(agg);
          setFaceplateCounties(counties);
          setFaceplateShowCountyList(true);
          setFaceplateVisible(true);
        }
      } else {
        setFaceplateVisible(false);
      }
    } else {
      backToProvinces();
    }
  }, [selectedFacility, activeProvince, countyGeoData, backToProvinces, language, t]);

  const handleMapClick = useCallback(() => {
    if (selectedFacility) {
      closeFaceplate();
    } else if (viewMode === 'counties') {
      backToProvinces();
    } else {
      closeFaceplate();
    }
  }, [viewMode, selectedFacility, backToProvinces, closeFaceplate]);

  const handleTileToggle = useCallback(() => {
    setActiveTile(prev => {
      const allowed = theme === 'light' ? ['light', 'satellite'] : ['dark', 'satellite'];
      const idx = allowed.indexOf(prev);
      return allowed[(idx + 1) % allowed.length];
    });
  }, [theme]);

  const handleFlyToPoland = useCallback(() => {
    if (viewMode === 'counties') {
      backToProvinces();
    } else {
      setFlyTrigger(t => t + 1);
    }
  }, [viewMode, backToProvinces]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // ===== KEYBOARD =====
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedFacility) {
          handleBackFromFacility();
        } else if (viewMode === 'counties') {
          backToProvinces();
        } else {
          closeFaceplate();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [viewMode, selectedFacility, backToProvinces, closeFaceplate, handleBackFromFacility]);

  // Refresh province data when switching back
  useEffect(() => {
    if (viewMode === 'provinces' && faceplateVisible && activeProvince && !selectedFacility) {
      const counties = getCountiesForProvince(countyGeoData, activeProvince);
      const agg = aggregateCountyData(counties);
      const pData = PROVINCE_DATA[activeProvince];
      if (pData) {
        setFaceplateTitle(provinceNames[activeProvince]?.[language] ?? pData.nameEN);
        setFaceplateSubtitle(`${t('app.province')} · ${counties.length} ${t('map.counties')}`);
        setFaceplateData(agg);
        setFaceplateCounties(counties);
        setFaceplateShowCountyList(true);
      }
    }
  }, [viewMode, faceplateVisible, activeProvince, countyGeoData, selectedFacility, language, t]);

  return (
    <div id="app">
      <Sidebar
        zoomLevel={zoomLevel}
        activeSection={activeSection}
        chatOpen={chatOpen}
        width={sidebarWidth}
        collapsed={sidebarCollapsed}
        theme={theme}
        settingsOpen={settingsOpen}
        onNavClick={setActiveSection}
        onFlyToPoland={handleFlyToPoland}
        onChatToggle={handleChatToggle}
        onWidthChange={setSidebarWidth}
        onCollapseToggle={handleSidebarCollapseToggle}
        onThemeToggle={handleThemeToggle}
        onSettingsToggle={handleSettingsToggle}
        onSettingsClose={handleSettingsClose}
      />
      <main id="main-content" className="main-content">
        <TopBar onSearch={handleSearch} onTileToggle={handleTileToggle} />
        <div className="map-wrapper">
          <MapView
            activeTile={activeTile}
            provinceGeoData={provinceGeoData}
            countyGeoData={countyGeoData}
            onZoomChange={setZoomLevel}
            onProvinceClick={handleProvinceClick}
            onCountyClick={handleCountyClick}
            onFacilityClick={handleFacilityClick}
            onMapClick={handleMapClick}
            viewMode={viewMode}
            activeProvince={activeProvince}
            activeCounty={activeCounty}
            activeFacilityId={selectedFacility?.id ?? null}
            flyToPolandTrigger={flyTrigger}
            searchQuery={searchQuery}
            faceplateVisible={faceplateVisible}
            faceplateWidth={faceplateWidth}
          />
          <Faceplate
            visible={faceplateVisible}
            title={faceplateTitle}
            subtitle={faceplateSubtitle}
            data={faceplateData}
            counties={faceplateCounties}
            viewMode={viewMode}
            showCountyList={faceplateShowCountyList}
            onClose={closeFaceplate}
            onBack={handleBackFromFacility}
            onCountyClick={handleCountyClickFromList}
            activeCounty={activeCounty}
            facility={selectedFacility}
            width={faceplateWidth}
            onWidthChange={setFaceplateWidth}
          />
          <ChatPanel open={chatOpen} onClose={handleChatToggle} />
        </div>
      </main>
    </div>
  );
}

export default App;
