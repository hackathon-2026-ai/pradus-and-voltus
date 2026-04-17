// ===== PROVINCE ENERGY DATA =====
const PROVINCE_DATA = {
    "śląskie":              { nameEN: "Silesia",            capital: "Katowice",                    color: "#6366f1" },
    "opolskie":             { nameEN: "Opole",              capital: "Opole",                       color: "#8b5cf6" },
    "wielkopolskie":        { nameEN: "Greater Poland",     capital: "Poznań",                      color: "#22d3ee" },
    "zachodniopomorskie":   { nameEN: "West Pomerania",     capital: "Szczecin",                    color: "#10b981" },
    "świętokrzyskie":      { nameEN: "Holy Cross",         capital: "Kielce",                      color: "#f59e0b" },
    "kujawsko-pomorskie":  { nameEN: "Kuyavia-Pomerania",  capital: "Bydgoszcz / Toruń",          color: "#f43f5e" },
    "podlaskie":            { nameEN: "Podlasie",           capital: "Białystok",                   color: "#14b8a6" },
    "dolnośląskie":        { nameEN: "Lower Silesia",      capital: "Wrocław",                     color: "#a855f7" },
    "podkarpackie":         { nameEN: "Subcarpathia",       capital: "Rzeszów",                     color: "#ec4899" },
    "małopolskie":         { nameEN: "Lesser Poland",      capital: "Kraków",                      color: "#e11d48" },
    "pomorskie":            { nameEN: "Pomerania",          capital: "Gdańsk",                      color: "#0ea5e9" },
    "warmińsko-mazurskie": { nameEN: "Warmia-Masuria",     capital: "Olsztyn",                     color: "#06b6d4" },
    "łódzkie":             { nameEN: "Łódź",              capital: "Łódź",                       color: "#d946ef" },
    "mazowieckie":          { nameEN: "Masovia",            capital: "Warszawa",                    color: "#fbbf24" },
    "lubelskie":            { nameEN: "Lublin",             capital: "Lublin",                      color: "#34d399" },
    "lubuskie":             { nameEN: "Lubusz",             capital: "Gorzów Wlkp. / Zielona Góra", color: "#4ade80" }
};

// ===== SEEDED RANDOM FOR COUNTY DATA =====
function seededRandom(seed) {
    let s = seed;
    return function() {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Generate deterministic energy data for a county
function generateCountyEnergy(countyName) {
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

// ===== TILE LAYERS =====
const TILE_LAYERS = {
    dark:      { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',   attribution: '&copy; OSM &copy; CARTO' },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
    light:     { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',   attribution: '&copy; OSM &copy; CARTO' }
};

// ===== GLOBALS =====
let map = null;
let provinceLayer = null;
let countyLayer = null;
let activeProvince = null;
let activeCounty = null;
let activeTile = 'dark';
let currentTileLayer = null;
let countyGeoData = null;
const tileOrder = ['dark', 'satellite', 'light'];
let viewMode = 'provinces'; // 'provinces' or 'counties'

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
    initMap();
    initSidebar();
    initSearch();
    initTileToggle();
    initFlyToPoland();
    initBackButton();
    await loadCounties();
    loadRegions();
});

function initMap() {
    // Disable Leaflet's default prefix and create the map without the built-in attribution
    map = L.map('map', { center: [51.9, 19.1], zoom: 6, minZoom: 3, maxZoom: 18, zoomControl: true, attributionControl: false });

    // Add a custom, emoji-free attribution control (shows OSM contributors and tile provider)
    window.customAttribution = L.control.attribution({ prefix: '' }).addTo(map);

    setTileLayer('dark');

    map.on('zoomend', () => { document.getElementById('zoom-level').textContent = map.getZoom(); });
}

function setTileLayer(name) {
    const tile = TILE_LAYERS[name];
    if (!tile) return;
    if (currentTileLayer) map.removeLayer(currentTileLayer);
    currentTileLayer = L.tileLayer(tile.url, { attribution: tile.attribution, maxZoom: 19, subdomains: 'abcd' }).addTo(map);
    activeTile = name;
    // Update custom attribution text to avoid flags/emojis and show OSM contributors
    try {
        const providerText = (tile.attribution || '').replace(/&copy;/g, '©').replace(/<[^>]*>/g, '').trim();
        const osmText = '© OpenStreetMap contributors';
        const final = providerText ? `${osmText} · ${providerText}` : osmText;
        if (window.customAttribution && window.customAttribution._container) {
            window.customAttribution._container.innerHTML = final;
        }
    } catch (e) {
        // ignore
    }
    if (countyLayer) countyLayer.bringToFront();
    if (provinceLayer) provinceLayer.bringToFront();
}

// ===== LOAD PROVINCES =====
async function loadRegions() {
    try {
        const resp = await fetch('poland.geojson');
        const data = await resp.json();
        renderProvinces(data);
    } catch (e) { console.error('Failed to load provinces:', e); }
}

// ===== LOAD COUNTIES =====
async function loadCounties() {
    try {
        const resp = await fetch('powiaty.geojson');
        countyGeoData = await resp.json();
    } catch (e) { console.error('Failed to load counties:', e); }
}

function getLoadColor(usage, capacity) {
    const load = (usage / capacity) * 100;
    if (load > 80) return '#dc2626';
    if (load > 65) return '#f59e0b';
    if (load > 50) return '#3b82f6';
    return '#22c55e';
}

function renderProvinces(data) {
    provinceLayer = L.geoJSON(data, {
        style: function(feature) {
            const nazwa = feature.properties.nazwa;
            const counties = getCountiesForProvince(nazwa);
            const agg = aggregateCountyData(counties);
            return {
                fillColor: getLoadColor(agg.usageMW, agg.capacityMW),
                fillOpacity: 0.55, color: 'rgba(148, 163, 184, 0.4)', weight: 1.5, opacity: 1
            };
        },
        onEachFeature: function(feature, layer) {
            const nazwa = feature.properties.nazwa;
            const d = PROVINCE_DATA[nazwa];
            const counties = getCountiesForProvince(nazwa);
            const agg = aggregateCountyData(counties);
            const load = Math.round((agg.usageMW / agg.capacityMW) * 100);
            const tip = d ? `⚡ ${d.nameEN} — ${Math.round(agg.usageMW)} / ${Math.round(agg.capacityMW)} MW (${load}%) — ${counties.length} counties` : nazwa;

            layer.bindTooltip(tip, { sticky: true, className: 'region-tooltip', direction: 'top', offset: [0, -10] });
            layer.on({
                mouseover: (e) => { if (activeProvince !== nazwa) { e.target.setStyle({ fillOpacity: 0.85, weight: 2.5, color: 'rgba(99, 102, 241, 0.7)' }); e.target.bringToFront(); } },
                mouseout: (e) => { if (activeProvince !== nazwa) provinceLayer.resetStyle(e.target); },
                click: (e) => { drillIntoProvince(nazwa, e.target); L.DomEvent.stopPropagation(e); }
            });
        }
    }).addTo(map);
}

// ===== COUNTY HELPERS =====
function getCountiesForProvince(provinceName) {
    if (!countyGeoData) return [];
    return countyGeoData.features.filter(f => f.properties.province === provinceName);
}

function aggregateCountyData(countyFeatures) {
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
        usageMW: totalUsage, capacityMW: totalCapacity, availableMW: totalAvailable,
        gridStability: Math.round(sumStability / n),
        renewableShare: Math.round(sumRenewable / n),
        reserveMargin: Math.round(sumReserve / n)
    };
}

// ===== DRILL INTO PROVINCE → SHOW COUNTIES =====
function drillIntoProvince(nazwa, layer) {
    const pData = PROVINCE_DATA[nazwa];
    if (!pData) return;
    activeProvince = nazwa;
    activeCounty = null;
    viewMode = 'counties';

    // Hide province outlines and show counties
    if (provinceLayer) map.removeLayer(provinceLayer);
    showCountiesOnMap(nazwa);

    // Fly to province bounds
    if (layer) {
        map.flyToBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 9, duration: 0.8 });
    }

    // Show faceplate with province aggregated data
    const counties = getCountiesForProvince(nazwa);
    const agg = aggregateCountyData(counties);
    showFaceplate(pData.nameEN, `Province · ${counties.length} counties`, agg, counties, true);
}

function showCountiesOnMap(provinceName) {
    if (countyLayer) { map.removeLayer(countyLayer); countyLayer = null; }
    if (!countyGeoData) return;

    const filtered = {
        type: 'FeatureCollection',
        features: countyGeoData.features.filter(f => f.properties.province === provinceName)
    };

    countyLayer = L.geoJSON(filtered, {
        style: function(feature) {
            const d = generateCountyEnergy(feature.properties.nazwa);
            return {
                fillColor: getLoadColor(d.usageMW, d.capacityMW),
                fillOpacity: 0.6, color: 'rgba(148, 163, 184, 0.5)', weight: 1, opacity: 1
            };
        },
        onEachFeature: function(feature, layer) {
            const nazwa = feature.properties.nazwa;
            const d = generateCountyEnergy(nazwa);
            const load = Math.round((d.usageMW / d.capacityMW) * 100);
            const displayName = nazwa.replace('powiat ', '');

            layer.bindTooltip(`${displayName} — ${d.usageMW} / ${d.capacityMW} MW (${load}%)`, {
                sticky: true, className: 'region-tooltip', direction: 'top', offset: [0, -10]
            });

            layer.on({
                mouseover: (e) => {
                    if (activeCounty !== nazwa) {
                        e.target.setStyle({ fillOpacity: 0.85, weight: 2.5, color: 'rgba(99, 102, 241, 0.7)' });
                        e.target.bringToFront();
                    }
                },
                mouseout: (e) => { if (activeCounty !== nazwa) countyLayer.resetStyle(e.target); },
                click: (e) => { selectCounty(nazwa, e.target); L.DomEvent.stopPropagation(e); }
            });
        }
    }).addTo(map);
}

// ===== SELECT COUNTY =====
function selectCounty(nazwa, layer) {
    activeCounty = nazwa;

    // Reset styles
    if (countyLayer) countyLayer.eachLayer(l => countyLayer.resetStyle(l));

    // Highlight
    if (layer) {
        // Keep the existing fill (background) color; only change the outline to a consistent style
        layer.setStyle({
            color: '#ff009d',
            weight: 10,
            opacity: 1,
            dashArray: '',
            lineCap: 'round',
            lineJoin: 'round'
        });
        layer.bringToFront();
        map.flyToBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 11, duration: 0.6 });
    }

    const d = generateCountyEnergy(nazwa);
    const displayName = nazwa.replace('powiat ', '');
    const pData = PROVINCE_DATA[activeProvince];

    // Show county data in faceplate
    showFaceplate(displayName, `County · ${pData ? pData.nameEN : ''}`, d, [], false);

    // Highlight county in the list
    document.querySelectorAll('#counties-list .city-item').forEach(el => {
        el.classList.toggle('active-county', el.dataset.county === nazwa);
    });
}

// ===== SHOW FACEPLATE =====
function showFaceplate(title, subtitle, data, counties, showCountyList) {
    const faceplate = document.getElementById('faceplate');
    faceplate.classList.remove('hidden');

    const backBtn = document.getElementById('btn-back-provinces');
    backBtn.classList.toggle('hidden', viewMode === 'provinces');

    document.getElementById('region-name').textContent = title;
    document.getElementById('region-capital').textContent = subtitle;

    document.getElementById('stat-usage').textContent = Math.round(data.usageMW) + ' MW';
    document.getElementById('stat-capacity').textContent = Math.round(data.capacityMW) + ' MW';
    document.getElementById('stat-available').textContent = Math.round(data.availableMW) + ' MW';
    document.getElementById('stat-load').textContent = Math.round((data.usageMW / data.capacityMW) * 100) + '%';

    // Bars
    ['bar-stability', 'bar-renewable', 'bar-reserve'].forEach(id => document.getElementById(id).style.width = '0%');
    setTimeout(() => {
        document.getElementById('bar-stability').style.width = data.gridStability + '%';
        document.getElementById('bar-renewable').style.width = data.renewableShare + '%';
        document.getElementById('bar-reserve').style.width = Math.min(data.reserveMargin, 100) + '%';
    }, 150);

    document.getElementById('stat-stability').textContent = data.gridStability + '%';
    document.getElementById('stat-renewable').textContent = data.renewableShare + '%';
    document.getElementById('stat-reserve').textContent = data.reserveMargin + '%';

    // County list
    const header = document.getElementById('counties-header');
    const list = document.getElementById('counties-list');
    list.innerHTML = '';

    if (showCountyList && counties.length > 0) {
        header.textContent = `Counties (${counties.length})`;
        counties
            .map(f => ({ name: f.properties.nazwa, data: generateCountyEnergy(f.properties.nazwa) }))
            .sort((a, b) => b.data.usageMW - a.data.usageMW)
            .forEach(({ name, data: cd }) => {
                const load = Math.round((cd.usageMW / cd.capacityMW) * 100);
                const item = document.createElement('div');
                item.className = 'city-item clickable';
                item.dataset.county = name;
                const display = name.replace('powiat ', '');
                const dotColor = load > 80 ? '#dc2626' : load > 65 ? '#f59e0b' : load > 50 ? '#3b82f6' : '#22c55e';
                item.innerHTML = `
                    <span class="city-dot" style="background:${dotColor};box-shadow:0 0 8px ${dotColor}44"></span>
                    <span class="city-name">${display}</span>
                    <span class="city-pop">${cd.usageMW}/${cd.capacityMW} MW</span>
                `;
                item.addEventListener('click', () => {
                    // Find the layer on map and select it
                    if (countyLayer) {
                        countyLayer.eachLayer(l => {
                            if (l.feature && l.feature.properties.nazwa === name) {
                                selectCounty(name, l);
                            }
                        });
                    }
                });
                list.appendChild(item);
            });
    } else if (!showCountyList) {
        header.textContent = 'County Details';
        const d = data;
        const rows = [
            { label: 'Current Usage', value: `${d.usageMW} MW`, color: '#f59e0b' },
            { label: 'Total Capacity', value: `${d.capacityMW} MW`, color: '#6366f1' },
            { label: 'Available', value: `${d.availableMW} MW`, color: '#10b981' },
            { label: 'Grid Stability', value: `${d.gridStability}%`, color: '#22d3ee' },
            { label: 'Renewable Share', value: `${d.renewableShare}%`, color: '#22c55e' },
            { label: 'Reserve Margin', value: `${d.reserveMargin}%`, color: '#f43f5e' }
        ];
        rows.forEach(r => {
            const item = document.createElement('div');
            item.className = 'city-item';
            item.innerHTML = `
                <span class="city-dot" style="background:${r.color};box-shadow:0 0 8px ${r.color}44"></span>
                <span class="city-name">${r.label}</span>
                <span class="city-pop">${r.value}</span>
            `;
            list.appendChild(item);
        });
    }
}

// ===== BACK TO PROVINCES =====
function backToProvinces() {
    viewMode = 'provinces';
    activeProvince = null;
    activeCounty = null;

    if (countyLayer) { map.removeLayer(countyLayer); countyLayer = null; }
    if (!provinceLayer) {
        loadRegions();
    } else {
        provinceLayer.addTo(map);
    }

    map.flyTo([51.9, 19.1], 6, { duration: 1 });
    closeFaceplate();
}

function initBackButton() {
    document.getElementById('btn-back-provinces').addEventListener('click', backToProvinces);
}

function closeFaceplate() {
    document.getElementById('faceplate').classList.add('hidden');
    if (viewMode === 'provinces' && provinceLayer) {
        provinceLayer.eachLayer(l => provinceLayer.resetStyle(l));
    }
    if (viewMode === 'counties' && countyLayer) {
        countyLayer.eachLayer(l => countyLayer.resetStyle(l));
    }
    activeCounty = null;
}

// ===== SIDEBAR =====
function initSidebar() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (item.dataset.section) {
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            }
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const rect = item.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            item.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            item.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.05}px, ${(e.clientY - rect.top - rect.height / 2) * 0.05}px)`;
        });
        item.addEventListener('mouseleave', () => { item.style.transform = ''; });
    });
}

// ===== SEARCH =====
function initSearch() {
    const input = document.getElementById('search-input');
    input.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const layer = viewMode === 'counties' ? countyLayer : provinceLayer;
        if (!layer || !q) { if (layer) layer.eachLayer(l => layer.resetStyle(l)); return; }
        layer.eachLayer(l => {
            const nazwa = l.feature?.properties?.nazwa || '';
            const d = PROVINCE_DATA[nazwa];
            const match = nazwa.toLowerCase().includes(q) || (d && d.nameEN.toLowerCase().includes(q)) || (d && d.capital.toLowerCase().includes(q));
            l.setStyle(match ? { fillOpacity: 0.8, weight: 2 } : { fillOpacity: 0.15, weight: 0.5 });
        });
    });
}

function initTileToggle() {
    document.getElementById('tile-toggle').addEventListener('click', () => {
        setTileLayer(tileOrder[(tileOrder.indexOf(activeTile) + 1) % tileOrder.length]);
    });
}

function initFlyToPoland() {
    document.getElementById('btn-fly-poland').addEventListener('click', (e) => {
        e.preventDefault();
        if (viewMode === 'counties') backToProvinces();
        else map.flyTo([51.9, 19.1], 6, { duration: 1.5 });
    });
}

document.getElementById('faceplate-close').addEventListener('click', closeFaceplate);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (viewMode === 'counties') backToProvinces(); else closeFaceplate(); } });
document.getElementById('map').addEventListener('click', (e) => {
    if (e.target.classList.contains('leaflet-container') || e.target.classList.contains('leaflet-tile') || e.target.classList.contains('leaflet-pane')) closeFaceplate();
});
