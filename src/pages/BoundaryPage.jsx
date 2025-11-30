// src/pages/BoundaryPage.jsx
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Polygon,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

export default function BoundaryPage({
  farm,
  boundary,
  setBoundary,
  farmCenter,
  setFarmCenter,
  onNext,
}) {
  const [postcode, setPostcode] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 🔍 Postcode / address search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    try {
      setIsSearching(true);

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        postcode
      )}`;

      // No custom headers – browser blocks User-Agent override
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Search request failed");
      }

      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        // 👉 update center; MapContainer will re-mount because of key
        setFarmCenter([parseFloat(lat), parseFloat(lon)]);
      } else {
        alert("Could not find that postcode. Try full postcode or a nearby town.");
      }
    } catch (err) {
      console.error("Postcode search error:", err);
      alert("Search failed. Check your connection or try another code.");
    } finally {
      setIsSearching(false);
    }
  };

  // 🟩 Draw / edit / delete boundary
  const handleCreated = (e) => {
    const layer = e.layer;
    if (!layer.getLatLngs) return;
    const latlngs = layer.getLatLngs()[0].map((p) => [p.lat, p.lng]);
    setBoundary(latlngs);
  };

  const handleEdited = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      if (!layer.getLatLngs) return;
      const latlngs = layer.getLatLngs()[0].map((p) => [p.lat, p.lng]);
      setBoundary(latlngs);
    });
  };

  const handleDeleted = () => {
    setBoundary(null);
  };

  const handleNext = () => {
    if (!boundary || boundary.length < 3) {
      alert("Please draw a boundary around your farm first.");
      return;
    }
    onNext();
  };

  return (
    <div className="map-page-shell">
      <div className="map-card">
        <div className="map-toolbar">
          <h2>Draw Farm Boundary</h2>
          <div style={{ marginLeft: 12, fontSize: 13, color: "#9ca3af" }}>
            {farm?.name || "New Farm"}
          </div>
          <div className="map-toolbar-spacer" />

          {/* 🔍 Search + button on top-right */}
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <input
              className="map-search-input"
              placeholder="Enter postcode or town…"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
            <button
  type="submit"
  disabled={isSearching}
  style={{
    padding: "8px 18px",
    borderRadius: "999px",
    background: "#ffffff",      // White background
    color: "#000000",           // Black text
    border: "1px solid #ffffff",
    cursor: isSearching ? "default" : "pointer",
    opacity: isSearching ? 0.7 : 1,
    fontWeight: 600,
    transition: "0.2s ease",
  }}
>
  {isSearching ? "Searching…" : "Search"}
</button>

          </form>
        </div>

        <div className="map-wrapper">
          {/* 👇 key forces map to re-initialise when farmCenter changes */}
          <MapContainer
            key={farmCenter.join(",")}
            center={farmCenter}
            zoom={16}
            scrollWheelZoom
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FeatureGroup>
              <EditControl
                position="topleft"
                onCreated={handleCreated}
                onEdited={handleEdited}
                onDeleted={handleDeleted}
                draw={{
                  polygon: true,
                  rectangle: true,
                  marker: true,
                  circle: false,
                  circlemarker: false,
                  polyline: false,
                }}
              />
              {boundary && <Polygon positions={boundary} />}
            </FeatureGroup>
          </MapContainer>
        </div>

        <div className="map-helper-text">
          <div>
            🔍 Use the search on the top right to jump to your field (postcode,
            village, etc.).
          </div>
          <div>
            ✏️ Use the polygon / rectangle tools on the left to outline the
            exact farm boundary. Pointer / edit tools let you move vertices.
          </div>
        </div>

        <button
          onClick={handleNext}
          className="button-primary"
          style={{ marginTop: 14 }}
          disabled={isSearching}
        >
          NEXT – Go to Dashboard
        </button>
      </div>
    </div>
  );
}

