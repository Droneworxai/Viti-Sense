// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
} from "react-leaflet";
import { getBoundaryCenter } from "../utils/geo.js";

export default function DashboardPage({ farm, boundary, farmCenter }) {
  const [mode, setMode] = useState("drone"); // "drone" | "robot"
  const [weather, setWeather] = useState(null);

  // Center map either on boundary centroid or default farm center
  const center = boundary?.length
    ? getBoundaryCenter(boundary)
    : farmCenter;

  // 🌤 Use Open-Meteo (no API key) to get current temp, humidity, rain, wind
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [lat, lon] = center;

        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,weather_code` +
          `&timezone=auto`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather API error");
        const data = await res.json();

        const cur = data.current;
        if (!cur) {
          setWeather(null);
          return;
        }

        setWeather({
          temp: cur.temperature_2m,                // °C
          humidity: cur.relative_humidity_2m,      // %
          rain: cur.rain ?? cur.precipitation ?? 0, // mm
          wind: cur.wind_speed_10m ?? 0,           // km/h default
          desc: describeWeatherCode(cur.weather_code),
        });
      } catch (e) {
        console.error("Open-Meteo error:", e);
        setWeather(null);
      }
    };

    fetchWeather();
  }, [center[0], center[1]]);

  // 🔷 Drone strips & robot path, constrained inside boundary
  const droneLines = boundary ? createDroneGridLines(boundary) : [];
  const robotPath = boundary ? createRobotZigZag(boundary) : [];

  return (
    <div className="dashboard-shell">
      <header
        style={{
          padding: "18px 40px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>
            VitiSense – Disease Control
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
            {farm?.name || "Your Farm"} • {farm?.type || "Vineyard"} •{" "}
            {center[0].toFixed(4)}, {center[1].toFixed(4)}
          </div>
        </div>
        <div className="chip-row">
          <span className="chip">Drone &amp; Robot Views</span>
          <span className="chip">Boundary-aware AI</span>
        </div>
      </header>

      <main className="dashboard-main">
        {/* LEFT SIDE – Weather + mode selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="panel">
            <h2>Today&apos;s Field Weather</h2>
            {weather ? (
              <>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {weather.temp.toFixed(1)}°C
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#9ca3af",
                    marginBottom: 10,
                    textTransform: "capitalize",
                  }}
                >
                  {weather.desc}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 10,
                    fontSize: 13,
                  }}
                >
                  <Metric label="Humidity" value={`${weather.humidity}%`} />
                  <Metric
                    label="Rain (now)"
                    value={`${weather.rain.toFixed(1)} mm`}
                  />
                  <Metric
                    label="Wind"
                    value={`${weather.wind.toFixed(1)} km/h`}
                  />
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "#9ca3af" }}>
                Live weather not available at the moment (Open-Meteo error).
              </div>
            )}
          </div>

          <div className="panel">
            <h2>How do you want to inspect?</h2>
            
            <div className="toggle-row">
              <button
                className={`toggle-btn ${
                  mode === "drone" ? "active" : ""
                }`}
                onClick={() => setMode("drone")}
              >
                Drone – Map
              </button>
              <button
                className={`toggle-btn ${
                  mode === "robot" ? "active" : ""
                }`}
                onClick={() => setMode("robot")}
              >
                Robot – Scouting
              </button>
            </div>
            
          </div>
        </div>

        {/* RIGHT SIDE – Map with overlays */}
        <div className="panel">
          <h2 style={{ marginBottom: 10 }}>
            {mode === "drone" ? "Drone Plan" : "Robot Patrol Path"}
          </h2>
          <div className="map-wrapper" style={{ height: 460 }}>
            <MapContainer
              center={center}
              zoom={17}
              scrollWheelZoom
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {boundary && (
                <Polygon
                  positions={boundary}
                  pathOptions={{ color: "#22c55e" }}
                />
              )}

              {mode === "drone" &&
                droneLines.map((line, idx) => (
                  <Polyline
                    key={idx}
                    positions={line}
                    pathOptions={{
                      color: "#22c55e",
                      dashArray: "4 6",
                    }}
                  />
                ))}

              {mode === "robot" && robotPath.length > 0 && (
                <Polyline
                  positions={robotPath}
                  pathOptions={{ color: "#38bdf8", weight: 3 }}
                />
              )}
            </MapContainer>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "#9ca3af",
              marginTop: 10,
            }}
          >
            All paths are generated within your boundary. Drone covers the field
            in strips, Robot follows a zig-zag row pattern for close inspection.
          </p>
        </div>
      </main>
    </div>
  );
}

/* ---------- Small UI component ---------- */

function Metric({ label, value }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        background: "#020617",
        border: "1px solid #1f2937",
      }}
    >
      <div style={{ fontSize: 11, color: "#9ca3af" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

/* ---------- Weather code helper ---------- */

function describeWeatherCode(code) {
  if (code === 0) return "clear sky";
  if (code === 1 || code === 2) return "mostly clear";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if (code === 51 || code === 53 || code === 55) return "drizzle";
  if (code === 61 || code === 63 || code === 65) return "rain";
  if (code === 71 || code === 73 || code === 75) return "snow";
  if (code === 80 || code === 81 || code === 82) return "rain showers";
  if (code === 95) return "thunderstorm";
  if (code === 96 || code === 99) return "thunderstorm with hail";
  return "unknown conditions";
}

/* ---------- Geometry helpers (same as before) ---------- */

function getLeftRightEdges(boundary) {
  if (!boundary || boundary.length < 4) return null;

  const sorted = [...boundary].sort((a, b) => a[1] - b[1]); // sort by lng

  const leftPoints = sorted.slice(0, 2);
  const rightPoints = sorted.slice(-2);

  leftPoints.sort((a, b) => a[0] - b[0]); // by lat
  rightPoints.sort((a, b) => a[0] - b[0]);

  const leftEdge = [leftPoints[0], leftPoints[1]];
  const rightEdge = [rightPoints[0], rightPoints[1]];

  return { leftEdge, rightEdge };
}

function createDroneGridLines(boundary) {
  const edges = getLeftRightEdges(boundary);
  if (!edges) return [];
  const { leftEdge, rightEdge } = edges;

  const lines = [];
  const strips = 5;

  for (let i = 1; i <= strips; i++) {
    const t = i / (strips + 1);

    const leftLat = leftEdge[0][0] + (leftEdge[1][0] - leftEdge[0][0]) * t;
    const leftLng = leftEdge[0][1] + (leftEdge[1][1] - leftEdge[0][1]) * t;

    const rightLat = rightEdge[0][0] + (rightEdge[1][0] - rightEdge[0][0]) * t;
    const rightLng = rightEdge[0][1] + (rightEdge[1][1] - rightEdge[0][1]) * t;

    lines.push([
      [leftLat, leftLng],
      [rightLat, rightLng],
    ]);
  }

  return lines;
}

function createRobotZigZag(boundary) {
  const edges = getLeftRightEdges(boundary);
  if (!edges) return [];
  const { leftEdge, rightEdge } = edges;

  const cols = 8;
  const path = [];
  let goingUp = true;

  for (let i = 0; i <= cols; i++) {
    const t = i / cols;

    const leftLat = leftEdge[0][0] + (leftEdge[1][0] - leftEdge[0][0]) * t;
    const leftLng = leftEdge[0][1] + (leftEdge[1][1] - leftEdge[0][1]) * t;

    const rightLat = rightEdge[0][0] + (rightEdge[1][0] - rightEdge[0][0]) * t;
    const rightLng = rightEdge[0][1] + (rightEdge[1][1] - rightEdge[0][1]) * t;

    const bottom = [leftLat, leftLng];
    const top = [rightLat, rightLng];

    if (goingUp) {
      path.push(bottom, top);
    } else {
      path.push(top, bottom);
    }

    goingUp = !goingUp;
  }

  return path;
}

