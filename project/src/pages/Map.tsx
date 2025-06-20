import React, { useState, useRef, useCallback } from 'react';
import { Filter, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MapboxMap from '../components/map/MapboxMap';
import MapControls from '../components/map/MapControls';
import MapFilters from '../components/map/MapFilters';
import MapStats from '../components/map/MapStats';
import { Incident, NewsItem } from '../types';

export default function Map() {
  const { incidents, news } = useApp();
  const mapRef = useRef<any>(null);
  
  const [filters, setFilters] = useState({
    types: ['crime', 'emergency', 'suspicious', 'traffic', 'fire', 'medical'],
    timeRange: '24h',
    severity: ['low', 'medium', 'high'],
    sources: ['citizen', 'authority', 'news', 'ai']
  });
  
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'incidents' | 'news' | 'ai-zones' | 'all'>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Filter data based on current filters
  const filteredIncidents = incidents.filter(incident => {
    const matchesType = filters.types.includes(incident.type);
    const matchesSeverity = filters.severity.includes(incident.aiAnalysis.severity);
    const matchesSource = filters.sources.includes(incident.reporter);
    
    // Time filter logic
    const now = new Date();
    const incidentTime = new Date(incident.timestamp);
    const timeDiff = now.getTime() - incidentTime.getTime();
    
    let matchesTime = true;
    switch (filters.timeRange) {
      case '1h':
        matchesTime = timeDiff <= 3600000;
        break;
      case '6h':
        matchesTime = timeDiff <= 21600000;
        break;
      case '24h':
        matchesTime = timeDiff <= 86400000;
        break;
      case '7d':
        matchesTime = timeDiff <= 604800000;
        break;
      case '30d':
        matchesTime = timeDiff <= 2592000000;
        break;
    }
    
    return matchesType && matchesSeverity && matchesSource && matchesTime;
  });

  const filteredNews = news.filter(item => {
    const matchesSeverity = filters.severity.includes(item.aiAnalysis.severity);
    const matchesSource = filters.sources.includes('news');
    
    // Time filter for news
    const now = new Date();
    const newsTime = new Date(item.timestamp);
    const timeDiff = now.getTime() - newsTime.getTime();
    
    let matchesTime = true;
    switch (filters.timeRange) {
      case '1h':
        matchesTime = timeDiff <= 3600000;
        break;
      case '6h':
        matchesTime = timeDiff <= 21600000;
        break;
      case '24h':
        matchesTime = timeDiff <= 86400000;
        break;
      case '7d':
        matchesTime = timeDiff <= 604800000;
        break;
      case '30d':
        matchesTime = timeDiff <= 2592000000;
        break;
    }
    
    return matchesSeverity && matchesSource && matchesTime;
  });

  const getTotalFilteredCount = () => {
    switch (activeLayer) {
      case 'incidents':
        return filteredIncidents.length;
      case 'news':
        return filteredNews.length;
      case 'all':
        return filteredIncidents.length + filteredNews.length;
      default:
        return filteredIncidents.length + filteredNews.length;
    }
  };

  const handleResetFilters = () => {
    setFilters({
      types: ['crime', 'emergency', 'suspicious', 'traffic', 'fire', 'medical'],
      timeRange: '24h',
      severity: ['low', 'medium', 'high'],
      sources: ['citizen', 'authority', 'news', 'ai']
    });
  };

  const handleLocationCenter = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [position.coords.longitude, position.coords.latitude],
              zoom: 14,
              duration: 2000
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : 'h-screen pt-16'} flex`}>
      {/* Sidebar */}
      <div className={`bg-slate-800/95 border-r border-slate-700 transition-all duration-300 ${
        showFilters ? 'w-80' : 'w-0 overflow-hidden'
      }`}>
        {showFilters && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Map Controls</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Stats */}
              <MapStats 
                incidents={filteredIncidents}
                news={filteredNews}
                filteredCount={getTotalFilteredCount()}
                activeLayer={activeLayer}
              />
            </div>

            {/* Filters */}
            <div className="flex-1 overflow-y-auto p-4">
              <MapFilters 
                filters={filters} 
                onFiltersChange={setFilters}
                onResetFilters={handleResetFilters}
              />
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute top-4 left-4 z-20 bg-slate-800/90 hover:bg-slate-700/90 text-white p-3 rounded-lg transition-colors shadow-lg border border-slate-700"
        >
          <Filter className="h-5 w-5" />
        </button>

        {/* Map */}
        <MapboxMap 
          incidents={filteredIncidents}
          news={filteredNews}
          showHeatmap={showHeatmap}
          activeLayer={activeLayer}
          onIncidentClick={setSelectedIncident}
          onNewsClick={setSelectedNews}
        />
        
        {/* Map Controls */}
        <MapControls
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          showHeatmap={showHeatmap}
          onHeatmapToggle={setShowHeatmap}
          onLocationCenter={handleLocationCenter}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />

        {/* Loading overlay when no token */}
        {!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN && (
          <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mapbox Token Required</h3>
              <p className="text-slate-400 max-w-md">
                Please add your Mapbox access token to the .env file to enable the interactive map.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}