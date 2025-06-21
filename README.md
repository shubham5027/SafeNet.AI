# SafeNet.AI Platform

Project Name & Team Members
SafeNet.AI
Team: Solo Developer – Shubham Kumbhar

SafeNet.AI is a next-generation civic safety intelligence platform that leverages AI, real-time data, and community reporting to provide actionable insights, threat analysis, and live incident mapping for public safety and emergency response.

---

## 🚀 Features

- **Incident Reporting:** Citizens can report incidents (crime, emergencies, suspicious activity, etc.) with location, description, and media uploads.
- **AI Threat Analysis:** Automated threat assessment, severity scoring, and tag extraction for incidents and news using AI.
- **Live Safety Map:** Interactive Mapbox map with clustering, heatmaps, and advanced filtering (type, severity, time, source).
- **News Aggregation:** Real-time safety and crime news feed with AI-powered analysis and categorization.
- **Intelligence Dashboard:** Visual analytics, trends, and pattern recognition for authorities and the public.
- **Gemini AI Chatbot:** Google Gemini-powered assistant for emergency guidance, safety tips, and general queries.
- **Backend API:** Node.js/Express server with MongoDB for incident storage, file uploads, and Gemini AI proxying.

---

## 🏗️ Project Structure

```
SafenetAI/
  project/
    src/
      components/      # Reusable UI components (charts, cards, map, etc.)
      context/         # React context for global state (incidents, news)
      pages/           # Main app pages (Dashboard, Map, NewsFeed, etc.)
      services/        # API and AI service integrations
      types/           # TypeScript types and interfaces
      utils/           # Utility functions
      index.css        # Tailwind CSS entry
      App.tsx          # Main app component (routing)
      main.tsx         # App entry point
    public/
    package.json       # Frontend dependencies and scripts
    ...
  server/
    index.js           # Express backend (API, uploads, Gemini proxy)
    uploads/           # Uploaded incident images
  README.md            # Project documentation (this file)
```

---

## 🖥️ Frontend (React + Vite)

- **Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Routing:** React Router v6
- **Map:** Mapbox GL JS, react-map-gl, supercluster (clustering)
- **AI Integration:** Google Gemini API (for chatbot, suggestions, analysis)
- **State Management:** React Context API
- **Charts & UI:** Custom components, Lucide icons

### Main Pages
- **Dashboard:** Overview, stats, recent incidents, threat map, safety tips
- **Report Incident:** Form for submitting new incidents (with AI suggestions)
- **Map:** Interactive map with filters, heatmap, clustering, and popups
- **News Feed:** Live news with search, category filter, and AI analysis
- **Intelligence:** AI-powered analytics, threat trends, and pattern recognition
- **Chatbot:** Gemini AI assistant for safety guidance and Q&A

---

## 🗄️ Backend (Node.js + Express + MongoDB)

- **API Endpoints:**
  - `POST /api/reports` — Create a new incident report
  - `GET /api/reports` — Fetch all incident reports
  - `POST /api/reports/upload` — Upload images for incidents
  - `POST /api/gemini` — Proxy to Google Gemini for AI analysis
- **Database:** MongoDB (Mongoose schema for reports)
- **File Uploads:** Multer (uploads stored in `server/uploads/`)
- **CORS:** Enabled for local development
- **Environment:** `.env` for MongoDB URI and Gemini API key

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone <repo-url>
cd SafenetAI/project
```

### 2. Install Dependencies
```bash
# Frontend
npm i

# Backend
cd ../server
npm i
```

### 3. Environment Variables
Create a `.env` file in both `project/` and `server/`:

#### Frontend (`project/.env`):
```
VITE_GNEWS_API_KEY=your_gnews_api_key
VITE_GNEWS_API_BASE_URL=https://gnews.io/api/v4
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_GEMINI_API_KEY=your_gemini_api_key
```

#### Backend (`server/.env`):
```
MONGO_URI=mongodb://localhost:27017/safenetai
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Backend Server
```bash
cd server
node index.js
# or use nodemon for auto-reload
```

### 5. Run the Frontend
```bash
cd project
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🧠 AI & Data Sources
- **Google Gemini:** Used for chatbot, incident suggestions, and threat analysis (API key required)
- **GNews API:** For real-time safety and crime news (API key required)
- **Mapbox:** For interactive map and geospatial features (API key required)

---

## 🛡️ Security & Privacy
- Do **not** share sensitive personal information in reports or chatbot.
- All incident data is stored securely in MongoDB and images in the server uploads folder.
- API keys should **never** be committed to version control.

---

## 🤝 Contributing

1. Fork the repo and create a feature branch.
2. Make your changes (with clear commits and comments).
3. Test thoroughly (frontend and backend).
4. Submit a pull request with a detailed description.

---

## 📄 License

This project is for educational and civic tech purposes. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Mapbox](https://www.mapbox.com/)
- [Google Gemini](https://ai.google.dev/gemini-api)
- [GNews](https://gnews.io/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/) 
