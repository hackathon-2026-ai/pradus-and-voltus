import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MapView, { type ViewMode } from './components/MapView';
import Faceplate from './components/Faceplate';
import ChatPanel from './components/ChatPanel';
import { TILE_ORDER } from './data/tileLayers';
import { PROVINCE_DATA } from './data/provinceData';
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

  const handleChatToggle = useCallback(() => {
    setChatOpen(prev => !prev);
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

    setFaceplateTitle(pData.nameEN);
    setFaceplateSubtitle(`Province · ${counties.length} counties`);
    setFaceplateData(data);
    setFaceplateCounties(counties);
    setFaceplateShowCountyList(true);
    setFaceplateVisible(true);
  }, []);

  const handleCountyClick = useCallback((countyName: string, data: EnergyData, provinceName: string) => {
    setActiveCounty(countyName);
    setSelectedFacility(null);
    const displayName = countyName.replace('powiat ', '');
    const pData = PROVINCE_DATA[provinceName];
    setFaceplateTitle(displayName);
    setFaceplateSubtitle(`County · ${pData ? pData.nameEN : ''}`);
    setFaceplateData(data);
    setFaceplateCounties([]);
    setFaceplateShowCountyList(false);
    setFaceplateVisible(true);
  }, []);

  const handleCountyClickFromList = useCallback((countyName: string) => {
    if (!activeProvince) return;
    const d = generateCountyEnergy(countyName);
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
          setFaceplateTitle(pData.nameEN);
          setFaceplateSubtitle(`Province · ${counties.length} counties`);
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
  }, [selectedFacility, activeProvince, countyGeoData, backToProvinces]);

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
      const idx = TILE_ORDER.indexOf(prev);
      return TILE_ORDER[(idx + 1) % TILE_ORDER.length];
    });
  }, []);

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
        setFaceplateTitle(pData.nameEN);
        setFaceplateSubtitle(`Province · ${counties.length} counties`);
        setFaceplateData(agg);
        setFaceplateCounties(counties);
        setFaceplateShowCountyList(true);
      }
    }
  }, [viewMode, faceplateVisible, activeProvince, countyGeoData, selectedFacility]);

  return (
    <div id="app">
      <Sidebar
        zoomLevel={zoomLevel}
        activeSection={activeSection}
        chatOpen={chatOpen}
        onNavClick={setActiveSection}
        onFlyToPoland={handleFlyToPoland}
        onChatToggle={handleChatToggle}
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
          />
          <ChatPanel open={chatOpen} onClose={handleChatToggle} />
        </div>
      </main>
    </div>
  );
}

export default App;
