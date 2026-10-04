// Script to simplify India GeoJSON to a usable size
const fs = require('fs');
const path = require('path');

// Read the full GeoJSON
console.log('Reading GeoJSON...');
const raw = fs.readFileSync(path.join(__dirname, '..', 'public', 'india-states.json'), 'utf8');
const geojson = JSON.parse(raw);

console.log(`Total features: ${geojson.features.length}`);

// Simplify coordinates using Douglas-Peucker algorithm
function simplifyLine(points, tolerance) {
  if (points.length <= 2) return points;
  
  let maxDist = 0;
  let maxIdx = 0;
  
  const start = points[0];
  const end = points[points.length - 1];
  
  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }
  
  if (maxDist > tolerance) {
    const left = simplifyLine(points.slice(0, maxIdx + 1), tolerance);
    const right = simplifyLine(points.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  
  return [start, end];
}

function perpendicularDistance(point, lineStart, lineEnd) {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  
  if (dx === 0 && dy === 0) {
    return Math.sqrt(
      Math.pow(point[0] - lineStart[0], 2) + 
      Math.pow(point[1] - lineStart[1], 2)
    );
  }
  
  const t = ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / (dx * dx + dy * dy);
  const closestX = lineStart[0] + t * dx;
  const closestY = lineStart[1] + t * dy;
  
  return Math.sqrt(
    Math.pow(point[0] - closestX, 2) + 
    Math.pow(point[1] - closestY, 2)
  );
}

function simplifyRing(ring, tolerance) {
  if (ring.length < 4) return ring;
  const simplified = simplifyLine(ring, tolerance);
  // Ensure ring is closed
  if (simplified[0][0] !== simplified[simplified.length-1][0] || 
      simplified[0][1] !== simplified[simplified.length-1][1]) {
    simplified.push(simplified[0]);
  }
  return simplified.length >= 4 ? simplified : ring.slice(0, 4);
}

function simplifyGeometry(geom, tolerance) {
  if (!geom) return geom;
  
  if (geom.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geom.coordinates.map(ring => simplifyRing(ring, tolerance))
    };
  } else if (geom.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geom.coordinates.map(polygon => 
        polygon.map(ring => simplifyRing(ring, tolerance))
      )
    };
  }
  return geom;
}

// High tolerance for significant simplification (0.05 degrees ≈ 5km)
const TOLERANCE = 0.05;

console.log('Simplifying geometries...');
const simplified = {
  type: 'FeatureCollection',
  features: geojson.features.map(feature => ({
    type: 'Feature',
    properties: {
      NAME_1: feature.properties.NAME_1 || feature.properties.ST_NM || feature.properties.name || 'Unknown',
      ID_1: feature.properties.ID_1 || feature.properties.GID_1 || '',
    },
    geometry: simplifyGeometry(feature.geometry, TOLERANCE)
  })).filter(f => f.geometry !== null)
};

const output = JSON.stringify(simplified);
const outputPath = path.join(__dirname, '..', 'public', 'india-states-simplified.json');
fs.writeFileSync(outputPath, output);

const originalSize = raw.length;
const newSize = output.length;
console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Simplified size: ${(newSize / 1024).toFixed(2)} KB`);
console.log(`Features: ${simplified.features.length}`);
console.log('Saved to india-states-simplified.json');
