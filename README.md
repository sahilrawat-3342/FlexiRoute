# FlexiRoute ✈️ (NearestAirport)

> **Multi-Airport Radius & Flexible Date Flight Search Engine**

FlexiRoute is a modern, responsive web application designed for budget-conscious travelers and digital nomads. Instead of locking you into a single airport and static dates, FlexiRoute scans neighboring airports within a customizable driving radius and evaluates flexible date windows to surface cheaper flight alternatives.

---

## 🌟 Key Features

- **Smart Driving Radius:** Automatically identifies and bundles commercial airports within your chosen driving distance (e.g. 50–250 miles) using client- and server-side Haversine distance calculations.
- **Instant Airport Autocomplete:** Ultra-responsive client-side airport search covering 8,000+ global commercial airports with IATA codes.
- **Flexible Dates Matrix:** Search flights with flexible date ranges (±1, ±2, ±3 days) to spot cheaper fares.
- **Modern Interactive UI:**
  - One-click origin/destination swap.
  - Interactive clickable departure and return date cards.
  - Real-time display showing the exact count of nearby airports dynamically as you drag the radius slider.
  - Categorized results (Direct, Flexible Routes, Alternate Airports).
- **Vercel Serverless Architecture:** Clean API routes powered by Node.js serverless functions integrated with Google Flights (via SerpApi).

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Radix UI
- **Backend / API:** Vercel Serverless Functions (`/api/search`, `/api/health`)
- **Data & APIs:** SerpApi (Google Flights Engine), Geospatial IATA Airport Database

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or pnpm

### 2. Clone the Repository

```bash
git clone https://github.com/sahilrawat-3342/NearestAirport.git
cd NearestAirport
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Add your API keys to `.env`:

```env
SerpApi_API_KEY="your_serpapi_key_here"
GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"
PORT=5000
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 📄 License

This project is licensed under the MIT License.
