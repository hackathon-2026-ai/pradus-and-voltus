import { useEffect, useRef, useCallback, type FC } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILE_LAYERS } from '../data/tileLayers';
import { PROVINCE_DATA } from '../data/provinceData';
import { useTranslation } from '../i18n/LanguageContext';
import { facilityTypeLabels, provinceNames } from '../i18n/translations';
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
import {
  ENERGY_FACILITIES,
  FACILITY_TYPE_CONFIG,
  type EnergyFacility,
} from '../data/energyFacilities';

export type ViewMode = 'provinces' | 'counties';

// ===== DISTANCE-BASED THINNING =====
// At country zoom, show max 1 pin per ~minDist degrees, prioritizing larger/real facilities
function thinByDistance(facilities: EnergyFacility[], minDist: number): EnergyFacility[] {
  // Sort: real facilities first (no 'g' prefix), then by capacity descending
  const sorted = [...facilities].sort((a, b) => {
    const aReal = a.id.startsWith('g') ? 0 : 1;
    const bReal = b.id.startsWith('g') ? 0 : 1;
    if (aReal !== bReal) return bReal - aReal;
    return b.capacityMW - a.capacityMW;
  });

  const kept: EnergyFacility[] = [];
  for (const f of sorted) {
    const tooClose = kept.some(k =>
      Math.abs(k.lat - f.lat) < minDist && Math.abs(k.lng - f.lng) < minDist
    );
    if (!tooClose) kept.push(f);
  }
  return kept;
}

// ===== SVG ICONS FOR EACH FACILITY TYPE =====
function getFacilityIconSVG(type: string) {
  switch (type) {
    case 'wind':
      return '<img src="/wind.svg" alt="Wiatrak" width="24" height="24" />'; // <--- TUTAJ POPRAWKA
    case 'solar':
      return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>';
    case 'coal':
      return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="1"/><path d="M8 10V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4"/><path d="M16 10V4"/><path d="M16 4c0 0 2-1 2 1"/></svg>';
    case 'hydro':
      return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2"><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M12 2v6"/><path d="M9 5l3 3 3-3"/></svg>';
    case 'storage':
      return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2"><rect x="6" y="4" width="12" height="16" rx="2"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/><line x1="6" y1="10" x2="18" y2="10"/><path d="M10 13l2 2 2-2"/></svg>';
    case 'biomass':
      return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2"><path d="M12 22c-4-4-8-7-8-12a8 8 0 0 1 16 0c0 5-4 8-8 12z"/><path d="M12 12c-2-2-2-5 0-7"/><path d="M12 12c2-2 2-5 0-7"/></svg>';
    case 'house':
      return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
    default:
      return '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="6" fill="white"/></svg>';
  }
}

interface MapViewProps {
  activeTile: string;
  provinceGeoData: ProvinceFeatureCollection | null;
  countyGeoData: CountyFeatureCollection | null;
  onZoomChange: (zoom: number) => void;
  onProvinceClick: (provinceName: string, data: EnergyData, counties: CountyFeature[], bounds: L.LatLngBounds) => void;
  onCountyClick: (countyName: string, data: EnergyData, provinceName: string) => void;
  onFacilityClick: (facility: EnergyFacility) => void;
  onMapClick: () => void;
  viewMode: ViewMode;
  activeProvince: string | null;
  activeCounty: string | null;
  activeFacilityId: string | null;
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
  onFacilityClick,
  onMapClick,
  viewMode,
  activeProvince,
  activeCounty,
  activeFacilityId,
  flyToPolandTrigger,
  searchQuery,
}) => {
  const { t, language } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const provinceLayerRef = useRef<L.GeoJSON | null>(null);
  const countyLayerRef = useRef<L.GeoJSON | null>(null);
  const facilityMarkersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const attributionRef = useRef<L.Control.Attribution | null>(null);
  const featureClickedRef = useRef(false);

  // Stable refs for callbacks and language so GeoJSON event handlers always see current values
  const languageRef = useRef(language);
  languageRef.current = language;
  const tRef = useRef(t);
  tRef.current = t;
  const activeProvinceRef = useRef(activeProvince);
  activeProvinceRef.current = activeProvince;
  const activeCountyRef = useRef(activeCounty);
  activeCountyRef.current = activeCounty;
  const onProvinceClickRef = useRef(onProvinceClick);
  onProvinceClickRef.current = onProvinceClick;
  const onCountyClickRef = useRef(onCountyClick);
  onCountyClickRef.current = onCountyClick;
  const onFacilityClickRef = useRef(onFacilityClick);
  onFacilityClickRef.current = onFacilityClick;
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
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

    map.on('click', () => {
      if (featureClickedRef.current) {
        featureClickedRef.current = false;
        return;
      }
      onMapClickRef.current();
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
        const loadColor = load > 80 ? '#ef4444' : load > 65 ? '#f59e0b' : load > 50 ? '#3b82f6' : '#22c55e';
        const lang = languageRef.current;
        const _t = tRef.current;
        const provName = provinceNames[nazwa]?.[lang] ?? d?.nameEN ?? nazwa;
        const tip = d ? `
          <div class="tt-card">
            <div class="tt-name">${provName}</div>
            <div class="tt-sub">${d.capital} · ${counties.length} ${_t('map.counties')}</div>
            <div class="tt-bar-wrap"><div class="tt-bar" style="width:${load}%;background:${loadColor}"></div></div>
            <div class="tt-stats">
              <div class="tt-stat"><span class="tt-stat-val">${Math.round(agg.usageMW)}</span><span class="tt-stat-lbl">${_t('map.mwUsed')}</span></div>
              <div class="tt-stat"><span class="tt-stat-val">${Math.round(agg.capacityMW)}</span><span class="tt-stat-lbl">${_t('map.mwCap')}</span></div>
              <div class="tt-stat"><span class="tt-stat-val" style="color:${loadColor}">${load}%</span><span class="tt-stat-lbl">${_t('map.load')}</span></div>
              <div class="tt-stat"><span class="tt-stat-val">${agg.renewableShare}%</span><span class="tt-stat-lbl">${_t('map.green')}</span></div>
            </div>
          </div>
        ` : nazwa;

        featureLayer.bindTooltip(tip, { sticky: true, className: 'region-tooltip', direction: 'top', offset: [0, -14] });

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
            featureClickedRef.current = true;
            const bounds = (e.target as L.Polygon).getBounds();
            onProvinceClickRef.current(nazwa, agg, counties, bounds);
            L.DomEvent.stopPropagation(e as unknown as Event);
          },
        });
      },
    }).addTo(map);

    provinceLayerRef.current = layer;
  }, [provinceGeoData, viewMode, language]);

  // ===== RENDER COUNTIES =====
  useEffect(() => {
    const map = mapRef.current;
    if (!map || viewMode !== 'counties' || !activeProvince || !countyGeoData) return;

    if (provinceLayerRef.current) {
      map.removeLayer(provinceLayerRef.current);
      provinceLayerRef.current = null;
    }
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
        const loadColor = load > 80 ? '#ef4444' : load > 65 ? '#f59e0b' : load > 50 ? '#3b82f6' : '#22c55e';
        const _t = tRef.current;

        const tip = `
          <div class="tt-card">
            <div class="tt-name">${displayName}</div>
            <div class="tt-bar-wrap"><div class="tt-bar" style="width:${load}%;background:${loadColor}"></div></div>
            <div class="tt-stats">
              <div class="tt-stat"><span class="tt-stat-val">${d.usageMW}</span><span class="tt-stat-lbl">${_t('map.mwUsed')}</span></div>
              <div class="tt-stat"><span class="tt-stat-val">${d.capacityMW}</span><span class="tt-stat-lbl">${_t('map.mwCap')}</span></div>
              <div class="tt-stat"><span class="tt-stat-val" style="color:${loadColor}">${load}%</span><span class="tt-stat-lbl">${_t('map.load')}</span></div>
            </div>
          </div>
        `;

        featureLayer.bindTooltip(tip, {
          sticky: true, className: 'region-tooltip', direction: 'top', offset: [0, -14],
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
            featureClickedRef.current = true;
            onCountyClickRef.current(nazwa, d, activeProvinceRef.current!);
            L.DomEvent.stopPropagation(e as unknown as Event);
          },
        });
      },
    }).addTo(map);

    countyLayerRef.current = layer;
    map.flyToBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 9, duration: 0.8 });

    // Cleanup: when viewMode changes away from counties (or deps change),
    // remove county layer so provinces can render cleanly
    return () => {
      if (countyLayerRef.current) {
        map.removeLayer(countyLayerRef.current);
        countyLayerRef.current = null;
      }
    };
  }, [viewMode, activeProvince, countyGeoData, language]);

  // ===== HIGHLIGHT SELECTED COUNTY =====
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !countyLayerRef.current) return;

    countyLayerRef.current.eachLayer(l => {
      countyLayerRef.current!.resetStyle(l as L.Path);
    });

    if (!activeCounty) return;

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

  // ===== FACILITY MARKERS =====
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    facilityMarkersRef.current.forEach(m => map.removeLayer(m));
    facilityMarkersRef.current = [];

    // Determine which facilities to show
    let facilitiesToShow: EnergyFacility[];
    if (viewMode === 'counties' && activeProvince) {
      // Province drill-down: show pins for that province, thinned to avoid pile-ups
      const provinceFacilities = ENERGY_FACILITIES.filter(f => f.province === activeProvince);
      facilitiesToShow = thinByDistance(provinceFacilities, 0.15);
    } else {
      // Country zoom: thin by distance — max 1 pin per ~0.5 degrees
      facilitiesToShow = thinByDistance(ENERGY_FACILITIES, 0.45);
    }

    facilitiesToShow.forEach((facility, idx) => {
      const config = FACILITY_TYPE_CONFIG[facility.type];
      const lang = languageRef.current;
      const ftLabel = facilityTypeLabels[facility.type]?.[lang] ?? config.label;

      const html = `
        <div class="facility-pin type-${facility.type}" style="animation-delay: ${idx * 0.05}s" data-facility-id="${facility.id}">
          <div class="facility-pin-icon pin-anim-${facility.type}">
            ${getFacilityIconSVG(facility.type)}
          </div>
          <div class="facility-label">
            <div>${facility.name}</div>
            <div class="facility-label-type">${ftLabel}${facility.capacityMW > 0 ? ' · ' + facility.capacityMW + ' MW' : ''}</div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'facility-marker-icon',
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });

      const marker = L.marker([facility.lat, facility.lng], { icon }).addTo(map);

      marker.on('click', (e: L.LeafletMouseEvent) => {
        featureClickedRef.current = true;
        onFacilityClickRef.current(facility);
        L.DomEvent.stopPropagation(e as unknown as Event);
      });

      facilityMarkersRef.current.push(marker);
    });
  }, [viewMode, activeProvince, language]);

  // ===== HIGHLIGHT ACTIVE FACILITY (without re-creating markers) =====
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remove active class from all pins
    container.querySelectorAll('.facility-pin.active').forEach(el => {
      el.classList.remove('active');
    });

    // Add active class to the selected pin
    if (activeFacilityId) {
      const pin = container.querySelector(`[data-facility-id="${activeFacilityId}"]`);
      if (pin) pin.classList.add('active');
    }
  }, [activeFacilityId]);

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

  return (
    <>
      <div id="map" className="map-container" ref={containerRef}></div>
      {/* Map Legend */}
      <div className="map-legend">
        {Object.entries(FACILITY_TYPE_CONFIG).map(([key, config]) => (
          <div key={key} className="legend-item">
            <span className="legend-dot" style={{ background: config.color }}></span>
            <span>{facilityTypeLabels[key]?.[language] ?? config.label}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default MapView;
