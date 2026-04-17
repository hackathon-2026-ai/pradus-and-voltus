const fs = require('fs');

const raw = fs.readFileSync('C:\\Users\\patri\\.gemini\\antigravity\\brain\\a145631a-468c-49f9-bf43-870d1fbb2175\\.system_generated\\steps\\25\\content.md', 'utf8');
const jsonStart = raw.indexOf('{');
const json = raw.substring(jsonStart);
const data = JSON.parse(json);

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

function simplifyDP(points, tolerance) {
  if (points.length <= 2) return points;
  let maxDist = 0, index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = sqSegDist(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) { maxDist = d; index = i; }
  }
  if (maxDist > tolerance * tolerance) {
    const left = simplifyDP(points.slice(0, index + 1), tolerance);
    const right = simplifyDP(points.slice(index), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
}

function simplifyCoords(coords, tolerance = 0.02) {
  const simplified = simplifyDP(coords, tolerance);
  return simplified.map(c => [Math.round(c[0] * 1000) / 1000, Math.round(c[1] * 1000) / 1000]);
}

function simplifyPolygon(polygon) {
  return polygon.map(ring => simplifyCoords(ring)).filter(r => r.length >= 4);
}

const simplified = {
  type: "FeatureCollection",
  features: data.features.map(f => {
    let coords;
    if (f.geometry.type === "MultiPolygon") {
      coords = f.geometry.coordinates.map(poly => simplifyPolygon(poly)).filter(p => p.length > 0);
      // Keep only the largest polygon for each feature
      if (coords.length > 1) {
        coords.sort((a, b) => {
          const aLen = a.reduce((s, r) => s + r.length, 0);
          const bLen = b.reduce((s, r) => s + r.length, 0);
          return bLen - aLen;
        });
        coords = coords.slice(0, 3); // Keep top 3 polygons
      }
    } else {
      coords = [simplifyPolygon(f.geometry.coordinates)];
    }
    return {
      type: "Feature",
      properties: { nazwa: f.properties.nazwa },
      geometry: {
        type: "MultiPolygon",
        coordinates: coords
      }
    };
  })
};

const output = JSON.stringify(simplified);
fs.writeFileSync('d:\\repo\\pradus-and-voltus\\frontend-web\\poland.geojson', output);
console.log('File size:', Math.round(output.length / 1024), 'KB');
console.log('Features:', simplified.features.length);
simplified.features.forEach(f => {
  const totalPoints = f.geometry.coordinates.reduce((s, p) => s + p.reduce((s2, r) => s2 + r.length, 0), 0);
  console.log(`  ${f.properties.nazwa}: ${totalPoints} points`);
});
