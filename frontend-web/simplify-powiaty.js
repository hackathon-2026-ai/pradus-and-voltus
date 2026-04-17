const fs = require('fs');

// Douglas-Peucker simplification
function sqDist(p1, p2) {
    const dx = p1[0] - p2[0], dy = p1[1] - p2[1];
    return dx * dx + dy * dy;
}
function sqSegDist(p, p1, p2) {
    let x = p1[0], y = p1[1], dx = p2[0] - x, dy = p2[1] - y;
    if (dx !== 0 || dy !== 0) {
        const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) { x = p2[0]; y = p2[1]; }
        else if (t > 0) { x += dx * t; y += dy * t; }
    }
    dx = p[0] - x; dy = p[1] - y;
    return dx * dx + dy * dy;
}
function simplifyDP(points, sqTol) {
    const len = points.length;
    if (len <= 2) return points;
    const markers = new Uint8Array(len);
    markers[0] = markers[len - 1] = 1;
    const stack = [[0, len - 1]];
    while (stack.length) {
        const [first, last] = stack.pop();
        let maxSqDist = 0, index = 0;
        for (let i = first + 1; i < last; i++) {
            const d = sqSegDist(points[i], points[first], points[last]);
            if (d > maxSqDist) { maxSqDist = d; index = i; }
        }
        if (maxSqDist > sqTol) {
            markers[index] = 1;
            if (first + 1 < index) stack.push([first, index]);
            if (index + 1 < last) stack.push([index, last]);
        }
    }
    return points.filter((_, i) => markers[i]);
}

// Province mapping by ID ranges (based on common Polish GUS coding)
// We'll determine province from centroid location instead
const PROVINCE_BOUNDS = {
    "dolnośląskie": { minLat: 50.3, maxLat: 51.8, minLng: 14.8, maxLng: 17.8 },
    "kujawsko-pomorskie": { minLat: 52.3, maxLat: 53.6, minLng: 17.5, maxLng: 19.9 },
    "lubelskie": { minLat: 50.2, maxLat: 52.3, minLng: 21.8, maxLng: 24.2 },
    "lubuskie": { minLat: 51.4, maxLat: 52.9, minLng: 14.4, maxLng: 16.2 },
    "łódzkie": { minLat: 51.0, maxLat: 52.4, minLng: 18.6, maxLng: 20.7 },
    "małopolskie": { minLat: 49.2, maxLat: 50.5, minLng: 19.1, maxLng: 21.3 },
    "mazowieckie": { minLat: 51.0, maxLat: 53.0, minLng: 19.3, maxLng: 22.5 },
    "opolskie": { minLat: 50.0, maxLat: 51.1, minLng: 16.8, maxLng: 18.5 },
    "podkarpackie": { minLat: 49.0, maxLat: 50.8, minLng: 21.3, maxLng: 24.2 },
    "podlaskie": { minLat: 52.5, maxLat: 54.4, minLng: 21.6, maxLng: 24.0 },
    "pomorskie": { minLat: 53.4, maxLat: 54.9, minLng: 16.7, maxLng: 19.7 },
    "śląskie": { minLat: 49.3, maxLat: 50.9, minLng: 18.1, maxLng: 19.9 },
    "świętokrzyskie": { minLat: 50.3, maxLat: 51.2, minLng: 19.6, maxLng: 21.4 },
    "warmińsko-mazurskie": { minLat: 53.1, maxLat: 54.5, minLng: 19.1, maxLng: 22.5 },
    "wielkopolskie": { minLat: 51.5, maxLat: 53.1, minLng: 15.8, maxLng: 19.1 },
    "zachodniopomorskie": { minLat: 52.6, maxLat: 54.5, minLng: 14.0, maxLng: 16.9 }
};

function getCentroid(feature) {
    const coords = feature.geometry.type === 'MultiPolygon'
        ? feature.geometry.coordinates[0][0]
        : feature.geometry.coordinates[0];
    let sumLng = 0, sumLat = 0;
    coords.forEach(c => { sumLng += c[0]; sumLat += c[1]; });
    return [sumLng / coords.length, sumLat / coords.length];
}

function findProvince(lng, lat) {
    let bestMatch = null;
    let bestDist = Infinity;
    for (const [name, b] of Object.entries(PROVINCE_BOUNDS)) {
        if (lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng) {
            // Calculate distance to center of province bounds
            const cLat = (b.minLat + b.maxLat) / 2;
            const cLng = (b.minLng + b.maxLng) / 2;
            const dist = Math.sqrt((lat - cLat) ** 2 + (lng - cLng) ** 2);
            if (dist < bestDist) { bestDist = dist; bestMatch = name; }
        }
    }
    return bestMatch;
}

const raw = JSON.parse(fs.readFileSync('powiaty-raw.geojson', 'utf8'));
const tolerance = 0.003; // Simplification tolerance

const simplified = {
    type: 'FeatureCollection',
    features: raw.features.map(f => {
        const simplifyCoords = (ring) => {
            const s = simplifyDP(ring, tolerance * tolerance);
            return s.map(c => [Math.round(c[0] * 1000) / 1000, Math.round(c[1] * 1000) / 1000]);
        };

        let geometry;
        if (f.geometry.type === 'MultiPolygon') {
            geometry = {
                type: 'MultiPolygon',
                coordinates: f.geometry.coordinates.map(poly =>
                    poly.map(ring => simplifyCoords(ring))
                )
            };
        } else {
            geometry = {
                type: 'Polygon',
                coordinates: f.geometry.coordinates.map(ring => simplifyCoords(ring))
            };
        }

        const [lng, lat] = getCentroid(f);
        const province = findProvince(lng, lat);

        return {
            type: 'Feature',
            geometry,
            properties: {
                nazwa: f.properties.nazwa,
                id: f.properties.id,
                province: province
            }
        };
    })
};

fs.writeFileSync('powiaty.geojson', JSON.stringify(simplified));
const sizeKB = Math.round(fs.statSync('powiaty.geojson').size / 1024);
console.log(`Done! ${simplified.features.length} counties, ${sizeKB}KB`);

// Print province distribution
const prov = {};
simplified.features.forEach(f => {
    const p = f.properties.province || 'UNKNOWN';
    prov[p] = (prov[p] || 0) + 1;
});
Object.entries(prov).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
