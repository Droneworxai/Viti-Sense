// src/utils/geo.js
export function getBoundaryCenter(boundary) {
  if (!boundary || boundary.length === 0) return [52.28, -1.58];
  let lat = 0,
    lng = 0;
  boundary.forEach(([la, lo]) => {
    lat += la;
    lng += lo;
  });
  return [lat / boundary.length, lng / boundary.length];
}

