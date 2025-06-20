import React from 'react';
import { Layers, Users, Newspaper, Brain, Thermometer, MapPin, Navigation } from 'lucide-react';

interface MapControlsProps {
  activeLayer: 'incidents' | 'news' | 'ai-zones' | 'all';
  onLayerChange: (layer: 'incidents' | 'news' | 'ai-zones' | 'all') => void;
  showHeatmap: boolean;
  onHeatmapToggle: (show: boolean) => void;
  onLocationCenter?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export default function MapControls({
  activeLayer,
  onLayerChange,
  showHeatmap,
  onHeatmapToggle,
  onLocationCenter,
  onZoomIn,
  onZoomOut
}: MapControlsProps) {
  const layers = [
    {
      id: 'all' as const,
      label: 'All Data',
      icon: Layers,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Show all incidents and news'
    },
    {
      id: 'incidents' as const,
      label: 'User Reports',
      icon: Users,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Citizen-reported incidents'
    },
    {
      id: 'news' as const,
      label: 'News Events',
      icon: Newspaper,
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'News-sourced events'
    },
    {
      id: 'ai-zones' as const,
      label: 'AI Flagged',
      icon: Brain,
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'AI-identified risk zones'
    }
  ];

  return (
    <>
      {/* Layer Controls - Left Side */}
      <div className="absolute top-4 left-4 space-y-2 z-10">
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 p-4 shadow-xl">
          <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
            <Layers className="h-4 w-4" />
            <span>Data Layers</span>
          </h3>
          
          <div className="space-y-2">
            {layers.map((layer) => {
              const Icon = layer.icon;
              const isActive = activeLayer === layer.id;
              
              return (
                <button
                  key={layer.id}
                  onClick={() => onLayerChange(layer.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? `${layer.color} shadow-lg`
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={layer.description}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <div className="text-left flex-1">
                    <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {layer.label}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Heatmap Toggle */}
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-300">Heatmap</span>
            </div>
            <button
              onClick={() => onHeatmapToggle(!showHeatmap)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showHeatmap ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showHeatmap ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Map Navigation Controls - Right Side */}
      <div className="absolute top-4 right-4 space-y-2 z-10">
        {/* Location Center */}
        {onLocationCenter && (
          <button
            onClick={onLocationCenter}
            className="bg-slate-900/95 hover:bg-slate-800/95 backdrop-blur-sm text-white p-3 rounded-lg transition-colors shadow-xl border border-slate-700"
            title="Center on current location"
          >
            <Navigation className="h-5 w-5" />
          </button>
        )}

        {/* Zoom Controls */}
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 shadow-xl">
          <button
            onClick={onZoomIn}
            className="block w-full p-3 text-white hover:bg-slate-800/95 transition-colors border-b border-slate-700 rounded-t-lg"
            title="Zoom in"
          >
            <span className="text-lg font-bold">+</span>
          </button>
          <button
            onClick={onZoomOut}
            className="block w-full p-3 text-white hover:bg-slate-800/95 transition-colors rounded-b-lg"
            title="Zoom out"
          >
            <span className="text-lg font-bold">−</span>
          </button>
        </div>
      </div>

      {/* Legend - Bottom Left */}
      <div className="absolute bottom-20 left-4 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 p-4 max-w-xs shadow-xl z-10">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span>Threat Levels</span>
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border border-white"></div>
            <span className="text-xs text-slate-300">High Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full border border-white"></div>
            <span className="text-xs text-slate-300">Medium Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full border border-white"></div>
            <span className="text-xs text-slate-300">Low Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-4 bg-blue-500 rounded-full border border-white flex items-center justify-center">
              <span className="text-white text-xs font-bold">5</span>
            </div>
            <span className="text-xs text-slate-300">Clustered Points</span>
          </div>
        </div>
      </div>
    </>
  );
}