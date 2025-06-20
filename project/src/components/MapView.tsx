import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Incident } from '../types';

interface MapViewProps {
  incidents: Incident[];
  showHeatmap: boolean;
}

export default function MapView({ incidents, showHeatmap }: MapViewProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500 border-red-400';
      case 'medium':
        return 'bg-yellow-500 border-yellow-400';
      case 'low':
        return 'bg-green-500 border-green-400';
      default:
        return 'bg-gray-500 border-gray-400';
    }
  };

  const getIncidentIcon = (type: string) => {
    const icons = {
      crime: '🚨',
      emergency: '🆘',
      suspicious: '👁️',
      traffic: '🚗',
      fire: '🔥',
      medical: '🏥'
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  return (
    <div className="w-full h-full bg-slate-800 relative overflow-hidden">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full p-4">
            {Array.from({ length: 144 }, (_, i) => (
              <div key={i} className="bg-slate-600 rounded"></div>
            ))}
          </div>
        </div>

        {/* Street-like patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-slate-600 opacity-30"></div>
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-600 opacity-30"></div>
          <div className="absolute top-3/4 left-0 right-0 h-1 bg-slate-600 opacity-30"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-slate-600 opacity-30"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-600 opacity-30"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-slate-600 opacity-30"></div>
        </div>

        {/* Heatmap Overlay */}
        {showHeatmap && (
          <div className="absolute inset-0">
            {incidents.filter(i => i.aiAnalysis.severity === 'high').map((incident, index) => (
              <div
                key={`heat-${incident.id}`}
                className="absolute rounded-full bg-red-500/20 blur-xl"
                style={{
                  width: '150px',
                  height: '150px',
                  left: `${20 + (index * 25) % 60}%`,
                  top: `${15 + (index * 20) % 70}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Incident Markers */}
        {incidents.map((incident, index) => (
          <div
            key={incident.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${20 + (index * 25) % 60}%`,
              top: `${15 + (index * 20) % 70}%`
            }}
          >
            {/* Marker */}
            <div className={`w-8 h-8 rounded-full border-2 ${getSeverityColor(incident.aiAnalysis.severity)} flex items-center justify-center text-white text-xs font-bold shadow-lg group-hover:scale-110 transition-transform`}>
              <span>{getIncidentIcon(incident.type)}</span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 min-w-64 z-10">
              <div className="text-sm font-medium mb-1">{incident.title}</div>
              <div className="text-xs text-slate-300 mb-2 line-clamp-2">{incident.description}</div>
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-1 rounded ${getSeverityColor(incident.aiAnalysis.severity)} bg-opacity-20`}>
                  {incident.aiAnalysis.severity} risk
                </span>
                <span className="text-slate-400 capitalize">{incident.type}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Confidence: {Math.round(incident.aiAnalysis.confidence * 100)}%
              </div>
            </div>
          </div>
        ))}

        {/* Center Marker (User Location) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-20 right-4 flex flex-col space-y-2">
        <button className="bg-slate-800/90 hover:bg-slate-700/90 text-white p-3 rounded-lg transition-colors shadow-lg">
          <Navigation className="h-5 w-5" />
        </button>
        <button className="bg-slate-800/90 hover:bg-slate-700/90 text-white p-3 rounded-lg transition-colors shadow-lg text-sm font-bold">
          +
        </button>
        <button className="bg-slate-800/90 hover:bg-slate-700/90 text-white p-3 rounded-lg transition-colors shadow-lg text-sm font-bold">
          -
        </button>
      </div>

      {/* Loading State */}
      {incidents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">Loading incident data...</p>
          </div>
        </div>
      )}
    </div>
  );
}