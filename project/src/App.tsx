import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ReportIncident from './pages/ReportIncident';
import Map from './pages/Map';
import NewsFeed from './pages/NewsFeed';
import Intelligence from './pages/Intelligence';
import Chatbot from './pages/Chatbot';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-900 text-white">
        <Navigation />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/report" element={<ReportIncident />} />
            <Route path="/map" element={<Map />} />
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/intelligence" element={<Intelligence />} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  );
}

export default App;