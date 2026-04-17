import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MapView, { type ViewMode } from './components/MapView';
import Faceplate from './components/Faceplate';
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

    // Show faceplate with province aggregated data
    setFaceplateTitle(pData.nameEN);
    setFaceplateSubtitle(`Province · ${counties.length} counties`);
    setFaceplateData(data);
    setFaceplateCounties(counties);
    setFaceplateShowCountyList(true);
    setFaceplateVisible(true);
  }, []);

  const handleCountyClick = useCallback((countyName: string, data: EnergyData, provinceName: string) => {
    setActiveCounty(countyName);
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

  const closeFaceplate = useCallback(() => {
    setFaceplateVisible(false);
    setActiveCounty(null);
  }, []);

  const backToProvinces = useCallback(() => {
    setViewMode('provinces');
    setActiveProvince(null);
    setActiveCounty(null);
    setFaceplateVisible(false);
    setFlyTrigger(t => t + 1);
  }, []);

  const handleMapClick = useCallback(() => {
    closeFaceplate();
  }, [closeFaceplate]);

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
        if (viewMode === 'counties') {
          backToProvinces();
        } else {
          closeFaceplate();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [viewMode, backToProvinces, closeFaceplate]);

  // When coming back to provinces and faceplate is open for a county, refresh province data
  useEffect(() => {
    if (viewMode === 'provinces' && faceplateVisible && activeProvince) {
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
  }, [viewMode, faceplateVisible, activeProvince, countyGeoData]);

  return (
    <div id="app">
      <Sidebar
        zoomLevel={zoomLevel}
        activeSection={activeSection}
        onNavClick={setActiveSection}
        onFlyToPoland={handleFlyToPoland}
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
            onMapClick={handleMapClick}
            viewMode={viewMode}
            activeProvince={activeProvince}
            activeCounty={activeCounty}
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
            onBack={backToProvinces}
            onCountyClick={handleCountyClickFromList}
            activeCounty={activeCounty}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
