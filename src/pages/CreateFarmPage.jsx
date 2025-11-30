// src/pages/CreateFarmPage.jsx
import { useState, useEffect } from "react";

const FARM_TYPES = ["Vineyard", "Orchard", "Lavender Farm", "Field Crops"];

export default function CreateFarmPage({
  farm,
  setFarm,
  savedFarms = [],
  onNext,
  onGoToFarm,
}) {
  const [name, setName] = useState(farm?.name || "Warwickshire Vineyard");
  const [type, setType] = useState(farm?.type || "Vineyard");
  const [selectedFarmName, setSelectedFarmName] = useState("");

  // Auto-select first farm in dropdown
  useEffect(() => {
    if (!selectedFarmName && savedFarms.length > 0) {
      setSelectedFarmName(savedFarms[0].name);
    }
  }, [savedFarms, selectedFarmName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newFarm = { name, type };
    setFarm(newFarm); // App's upsertFarm
    onNext();
  };

  const handleGoToFarmInternal = () => {
    if (!selectedFarmName) return;
    onGoToFarm?.(selectedFarmName);
  };

  const handleNewFarm = () => {
    setName("");
    setType("Vineyard");
    setSelectedFarmName("");
  };

  return (
    <div className="app-shell">
      <div className="card">
        <h1>Create New Farm</h1>
        <p style={{ marginTop: 4, marginBottom: 22, color: "#9ca3af" }}>
          Welcome! Let&apos;s set up your farm in Warwickshire.
        </p>

        {/* My Farms section */}
        {savedFarms.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, color: "#9ca3af" }}>My Farms</span>
              <button
                type="button"
                onClick={handleNewFarm}
                style={{
                  borderRadius: 999,
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "#e5e7eb",
                  fontSize: 13,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                + New Farm
              </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={selectedFarmName}
                onChange={(e) => setSelectedFarmName(e.target.value)}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  border: "1px solid #111827",
                  padding: "8px 12px",
                  background: "#020617",
                  color: "#f9fafb",
                }}
              >
                <option value="" disabled>
                  Select a saved farm…
                </option>
                {savedFarms.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({f.type})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleGoToFarmInternal}
                style={{
                  borderRadius: 999,
                  border: "none",
                  background: "#ffffff",
                  color: "#000000",
                  fontWeight: 600,
                  padding: "8px 14px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Go to Farm
              </button>
            </div>
          </div>
        )}

        {/* Create / Edit farm form */}
        <form onSubmit={handleSubmit}>
          <label htmlFor="farmName">Farm Name</label>
          <input
            id="farmName"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Warwickshire Vineyard"
            required
          />

          <label htmlFor="farmType">Farm Type</label>
          <select
            id="farmType"
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {FARM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button type="submit" className="button-primary">
            NEXT – Draw Boundary
          </button>
        </form>
      </div>
    </div>
  );
}

