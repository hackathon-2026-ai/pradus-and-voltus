import { useEffect, useRef, useCallback, type FC } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILE_LAYERS } from '../data/tileLayers';
import { PROVINCE_DATA } from '../data/provinceData';
import {
  generateCountyEnergy,
  getLoadColor,
  getCountiesForProvince,
  aggregateCountyData,
  type CountyFeatureCollection,
  type ProvinceFeatureCollection,
  type EnergyData,
  type CountyFeature,
} from '../data/energyUtils';

export type ViewMode = 'provinces' | 'counties';

interface MapViewProps {
  activeTile: string;
  provinceGeoData: ProvinceFeatureCollection | null;
  countyGeoData: CountyFeatureCollection | null;
  onZoomChange: (zoom: number) => void;
  onProvinceClick: (provinceName: string, data: EnergyData, counties: CountyFeature[], bounds: L.LatLngBounds) => void;
  onCountyClick: (countyName: string, data: EnergyData, provinceName: string) => void;
  onMapClick: () => void;
  viewMode: ViewMode;
  activeProvince: string | null;
  activeCounty: string | null;
  flyToPolandTrigger: number;
  searchQuery: string;
}

const MapView: FC<MapViewProps> = ({
  activeTile,
  provinceGeoData,
  countyGeoData,
  onZoomChange,
  onProvinceClick,
  onCountyClick,
  onMapClick,
  viewMode,
  activeProvince,
  activeCounty,
  flyToPolandTrigger,
  searchQuery,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const provinceLayerRef = useRef<L.GeoJSON | null>(null);
  const countyLayerRef = useRef<L.GeoJSON | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const attributionRef = useRef<L.Control.Attribution | null>(null);

  // Stable refs for callbacks so GeoJSON event handlers always see current values
  const activeProvinceRef = useRef(activeProvince);
  activeProvinceRef.current = activeProvince;
  const activeCountyRef = useRef(activeCounty);
  activeCountyRef.current = activeCounty;
  const onProvinceClickRef = useRef(onProvinceClick);
  onProvinceClickRef.current = onProvinceClick;
  const onCountyClickRef = useRef(onCountyClick);
  onCountyClickRef.current = onCountyClick;
  const countyGeoDataRef = useRef(countyGeoData);
  countyGeoDataRef.current = countyGeoData;

  // ===== INIT MAP =====
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [51.9, 19.1],
      zoom: 6,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: false,
    });

    const attribution = L.control.attribution({ prefix: '' }).addTo(map);
    attributionRef.current = attribution;

    map.on('zoomend', () => {
      onZoomChange(map.getZoom());
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const target = e.originalEvent.target as HTMLElement;
      if (
        target.classList.contains('leaflet-container') ||
        target.classList.contains('leaflet-tile') ||
        target.classList.contains('leaflet-pane')
      ) {
        onMapClick();
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== TILE LAYER =====
  const setTileLayer = useCallback((name: string) => {
    const map = mapRef.current;
    if (!map) return;
    const tile = TILE_LAYERS[name];
    if (!tile) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(tile.url, {
      attribution: tile.attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Update attribution
    try {
      const providerText = (tile.attribution || '').replace(/&copy;/g, '©').replace(/<[^>]*>/g, '').trim();
      const osmText = '© OpenStreetMap contributors';
      const final = providerText ? `${osmText} · ${providerText}` : osmText;
      if (attributionRef.current) {
        const container = (attributionRef.current as unknown as { _container: HTMLElement })._container;
        if (container) container.innerHTML = final;
      }
    } catch (_) { /* ignore */ }

    if (countyLayerRef.current) countyLayerRef.current.bringToFront();
    if (provinceLayerRef.current) provinceLayerRef.current.bringToFront();
  }, []);

  useEffect(() => {
    setTileLayer(activeTile);
  }, [activeTile, setTileLayer]);

  // ===== RENDER PROVINCES =====
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !provinceGeoData) return;
    if (viewMode !== 'provinces') return;

    // Remove old layers
    if (provinceLayerRef.current) {
      map.removeLayer(provinceLayerRef.current);
      provinceLayerRef.current = null;
    }
    if (countyLayerRef.current) {
      map.removeLayer(countyLayerRef.current);
      countyLayerRef.current = null;
    }

    const layer = L.geoJSON(provinceGeoData as GeoJSON.FeatureCollection, {
      style: (feature) => {
        if (!feature) return {};
        const nazwa = feature.properties.nazwa;
        const counties = getCountiesForProvince(countyGeoDataRef.current, nazwa);
        const agg = aggregateCountyData(counties);
        return {
          fillColor: getLoadColor(agg.usageMW, agg.capacityMW),
          fillOpacity: 0.55,
          color: 'rgba(148, 163, 184, 0.4)',
          weight: 1.5,
          opacity: 1,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const nazwa = feature.properties.nazwa;
        const d = PROVINCE_DATA[nazwa];
        const counties = getCountiesForProvince(countyGeoDataRef.current, nazwa);
        const agg = aggregateCountyData(counties);
        const load = Math.round((agg.usageMW / agg.capacityMW) * 100);
        const tip = d
          ? `⚡ ${d.nameEN} — ${Math.round(agg.usageMW)} / ${Math.round(agg.capacityMW)} MW (${load}%) — ${counties.length} counties`
          : nazwa;

        featureLayer.bindTooltip(tip, { sticky: true, className: 'region-tooltip', direction: 'top', offset: [0, -10] });

        featureLayer.on({
          mouseover: (e: L.LeafletMouseEvent) => {
            if (activeProvinceRef.current !== nazwa) {
              (e.target as L.Path).setStyle({ fillOpacity: 0.85, weight: 2.5, color: 'rgba(99, 102, 241, 0.7)' });
              (e.target as L.Path).bringToFront();
            }
          },
          mouseout: (e: L.LeafletMouseEvent) => {
            if (activeProvinceRef.current !== nazwa && provinceLayerRef.current) {
              provinceLayerRef.current.resetStyle(e.target as L.Path);
            }
          },
          click: (e: L.LeafletMouseEvent) => {
            const bounds = (e.target as L.Polygon).getBounds();
            onProvinceClickRef.current(nazwa, agg, counties, bounds);
            L.DomEvent.stopPropagation(e as unknown as Event);
          },
        });
      },
    }).addTo(map);

    provinceLayerRef.current = layer;
  }, [provinceGeoData, viewMode]);

  // ===== RENDER COUNTIES =====
  useEffect(() => {
    const map = mapRef.current;
    if (!map || viewMode !== 'counties' || !activeProvince || !countyGeoData) return;

    // Remove province layer
    if (provinceLayerRef.current) {
      map.removeLayer(provinceLayerRef.current);
      provinceLayerRef.current = null;
    }
    // Remove old county layer
    if (countyLayerRef.current) {
      map.removeLayer(countyLayerRef.current);
      countyLayerRef.current = null;
    }

    const filtered: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: countyGeoData.features.filter(f => f.properties.province === activeProvince),
    };

    const layer = L.geoJSON(filtered, {
      style: (feature) => {
        if (!feature) return {};
        const d = generateCountyEnergy(feature.properties.nazwa);
        return {
          fillColor: getLoadColor(d.usageMW, d.capacityMW),
          fillOpacity: 0.6,
          color: 'rgba(148, 163, 184, 0.5)',
          weight: 1,
          opacity: 1,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const nazwa = feature.properties.nazwa;
        const d = generateCountyEnergy(nazwa);
        const load = Math.round((d.usageMW / d.capacityMW) * 100);
        const displayName = nazwa.replace('powiat ', '');

        featureLayer.bindTooltip(`${displayName} — ${d.usageMW} / ${d.capacityMW} MW (${load}%)`, {
          sticky: true, className: 'region-tooltip', direction: 'top', offset: [0, -10],
        });

        featureLayer.on({
          mouseover: (e: L.LeafletMouseEvent) => {
            if (activeCountyRef.current !== nazwa) {
              (e.target as L.Path).setStyle({ fillOpacity: 0.85, weight: 2.5, color: 'rgba(99, 102, 241, 0.7)' });
              (e.target as L.Path).bringToFront();
            }
          },
          mouseout: (e: L.LeafletMouseEvent) => {
            if (activeCountyRef.current !== nazwa && countyLayerRef.current) {
              countyLayerRef.current.resetStyle(e.target as L.Path);
            }
          },
          click: (e: L.LeafletMouseEvent) => {
            onCountyClickRef.current(nazwa, d, activeProvinceRef.current!);
            L.DomEvent.stopPropagation(e as unknown as Event);
          },
        });
      },
    }).addTo(map);

    countyLayerRef.current = layer;

    // Fly to county bounds
    map.flyToBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 9, duration: 0.8 });
  }, [viewMode, activeProvince, countyGeoData]);

  // ===== HIGHLIGHT SELECTED COUNTY =====
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !countyLayerRef.current) return;

    // Reset all county styles first
    countyLayerRef.current.eachLayer(l => {
      countyLayerRef.current!.resetStyle(l as L.Path);
    });

    if (!activeCounty) return;

    // Find and highlight the selected county
    countyLayerRef.current.eachLayer(l => {
      const geoLayer = l as L.GeoJSON & { feature?: GeoJSON.Feature };
      if (geoLayer.feature?.properties?.nazwa === activeCounty) {
        (l as L.Path).setStyle({
          color: '#ff009d',
          weight: 10,
          opacity: 1,
          dashArray: '',
          lineCap: 'round',
          lineJoin: 'round',
        });
        (l as L.Path).bringToFront();
        map.flyToBounds((l as L.Polygon).getBounds(), { padding: [40, 40], maxZoom: 11, duration: 0.6 });
      }
    });
  }, [activeCounty]);

  // ===== FLY TO POLAND =====
  useEffect(() => {
    if (flyToPolandTrigger === 0) return;
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([51.9, 19.1], 6, { duration: 1.5 });
  }, [flyToPolandTrigger]);

  // ===== SEARCH HIGHLIGHT =====
  useEffect(() => {
    const layer = viewMode === 'counties' ? countyLayerRef.current : provinceLayerRef.current;
    if (!layer) return;
    const q = searchQuery.toLowerCase().trim();

    if (!q) {
      layer.eachLayer(l => layer.resetStyle(l as L.Path));
      return;
    }

    layer.eachLayer(l => {
      const geoLayer = l as L.GeoJSON & { feature?: GeoJSON.Feature };
      const nazwa = geoLayer.feature?.properties?.nazwa || '';
      const d = PROVINCE_DATA[nazwa];
      const match =
        nazwa.toLowerCase().includes(q) ||
        (d && d.nameEN.toLowerCase().includes(q)) ||
        (d && d.capital.toLowerCase().includes(q));

      (l as L.Path).setStyle(match
        ? { fillOpacity: 0.8, weight: 2 }
        : { fillOpacity: 0.15, weight: 0.5 }
      );
    });
  }, [searchQuery, viewMode]);

  return <div id="map" className="map-container" ref={containerRef}></div>;
};

export default MapView;
