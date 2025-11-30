// src/App.jsx
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import CreateFarmPage from "./pages/CreateFarmPage.jsx";
import BoundaryPage from "./pages/BoundaryPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

const PrivateRoute = ({ isAuthed, children }) => {
  return isAuthed ? children : <Navigate to="/" replace />;
};

export default function App() {
  const [isAuthed, setIsAuthed] = useState(false);

  // Farm currently being edited / viewed
  const [farm, setFarm] = useState(null); // { name, type, boundary?, center? }

  // All saved farms (persisted in localStorage)
  const [savedFarms, setSavedFarms] = useState([]);

  // Geometry for the currently active farm
  const [boundary, setBoundary] = useState(null);
  const [farmCenter, setFarmCenter] = useState([52.28, -1.58]); // default: Warwickshire

  const navigate = useNavigate();

  // Load saved farms from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem("farmlink_saved_farms");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedFarms(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load farms from localStorage:", err);
    }
  }, []);

  // Persist farms whenever list changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "farmlink_saved_farms",
        JSON.stringify(savedFarms)
      );
    } catch (err) {
      console.error("Failed to save farms to localStorage:", err);
    }
  }, [savedFarms]);

  // Upsert farm into savedFarms (match by name)
  const upsertFarm = (newFarm) => {
    setFarm(newFarm);
    setSavedFarms((prev) => {
      const idx = prev.findIndex((f) => f.name === newFarm.name);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newFarm;
        return copy;
      }
      return [...prev, newFarm];
    });
  };

  // When user chooses an existing farm from "My Farms" and clicks Go
  const handleGoToSavedFarm = (farmName) => {
    const existing = savedFarms.find((f) => f.name === farmName);
    if (!existing) return;

    // Set as current farm
    setFarm(existing);

    // Restore boundary + center if saved
    setBoundary(existing.boundary || null);
    setFarmCenter(existing.center || [52.28, -1.58]);

    // Go straight to boundary page for that farm
    navigate("/farm/boundary");
  };

  // After the farmer finishes drawing boundary and presses "Next"
  const handleBoundaryNext = () => {
    if (farm) {
      const updatedFarm = {
        ...farm,
        boundary: boundary || farm.boundary || null,
        center: farmCenter || farm.center || null,
      };
      upsertFarm(updatedFarm);
    }
    navigate("/dashboard");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LoginPage
            onLogin={() => {
              setIsAuthed(true);
              navigate("/farm/new");
            }}
          />
        }
      />

      <Route
        path="/farm/new"
        element={
          <PrivateRoute isAuthed={isAuthed}>
            <CreateFarmPage
              farm={farm}
              setFarm={upsertFarm}
              savedFarms={savedFarms}
              onNext={() => {
                // Starting (or re-starting) a farm setup; clear boundary for now
                setBoundary(farm?.boundary || null);
                setFarmCenter(farm?.center || [52.28, -1.58]);
                navigate("/farm/boundary");
              }}
              onGoToFarm={handleGoToSavedFarm}
            />
          </PrivateRoute>
        }
      />

      <Route
        path="/farm/boundary"
        element={
          <PrivateRoute isAuthed={isAuthed}>
            <BoundaryPage
              farm={farm}
              boundary={boundary}
              setBoundary={setBoundary}
              farmCenter={farmCenter}
              setFarmCenter={setFarmCenter}
              onNext={handleBoundaryNext}
            />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute isAuthed={isAuthed}>
            <DashboardPage
              farm={farm}
              boundary={boundary}
              farmCenter={farmCenter}
            />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

