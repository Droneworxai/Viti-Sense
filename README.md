 # 🍇 Viti-Sense  
### Smart Vineyard Disease Monitoring & Autonomous Field Insights  
_A DroneWorx.ai project_

Viti-Sense is an intelligent field-management dashboard designed for vineyards.  
It combines **drone aerial imaging**, **robot row-based inspection**, and **real-time weather intelligence** to help farmers detect diseases early and plan optimal field operations.

This project includes:

- A fully interactive **farm setup wizard**
- Polygon-based **boundary drawing**
- **Drone grid coverage** visualization inside the farm
- **Robot zig-zag row inspection** inside the same boundary
- Live **weather and humidity** panels
- Clean, modern **dark-theme UI** built with React + Vite
- Local persistence of multiple farms (via `localStorage`)

---

## 🚀 Features

### 🌱 Create & Manage Farms
- Add new vineyards via a guided form  
- Save multiple farms locally  
- “Go to Farm” shortcut loads previous boundaries & settings  

### 🗺 Draw Farm Boundaries  
Powered by **Leaflet + Geoman**  
- Search by postcode / location  
- Draw, edit, or remove boundaries  
- Snap the map to your farm automatically  

### 🤖 Drone & Robot Field Inspection
- **Drone Mode:** Generates an aerial grid path  
- **Robot Mode:** Generates a zig-zag row-based path  
- All paths stay inside the farmer’s boundary  

### 🌤 Weather Intelligence  
- Temperature  
- Rain chance  
- Humidity  
- Wind  
  
---


## 🏗 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Mapping | Leaflet, Leaflet-Geoman |
| UI | Custom Tailwind-style dark theme |
| State | React Hooks + localStorage |
| Build | Vite |
| Deployment | (Optional) Netlify / Vercel |

---

## 📦 Installation

```bash
git clone https://github.com/Droneworxai/Viti-Sense.git
cd Viti-Sense
npm install
npm run dev
```

After starting the development server, access the dashboard at:

➡️ http://localhost:5173






