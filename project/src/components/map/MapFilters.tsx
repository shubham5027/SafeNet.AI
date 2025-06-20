import React from 'react';
import { Calendar, Clock, Tag, Filter, AlertTriangle } from 'lucide-react';

interface MapFiltersProps {
  filters: {
    types: string[];
    timeRange: string;
    severity: string[];
    sources: string[];
  };
  onFiltersChange: (filters: any) => void;
  onResetFilters: () => void;
}

export default function MapFilters({ filters, onFiltersChange, onResetFilters }: MapFiltersProps) {
  const incidentTypes = [
    { value: 'crime', label: 'Crime', icon: '🚨', count: 12 },
    { value: 'emergency', label: 'Emergency', icon: '🆘', count: 8 },
    { value: 'suspicious', label: 'Suspicious', icon: '👁️', count: 15 },
    { value: 'traffic', label: 'Traffic', icon: '🚗', count: 23 },
    { value: 'fire', label: 'Fire', icon: '🔥', count: 5 },
    { value: 'medical', label: 'Medical', icon: '🏥', count: 7 }
  ];

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const severityLevels = [
    { value: 'high', label: 'High Risk', color: 'text-red-400', bgColor: 'bg-red-500' },
    { value: 'medium', label: 'Medium Risk', color: 'text-yellow-400', bgColor: 'bg-amber-500' },
    { value: 'low', label: 'Low Risk', color: 'text-green-400', bgColor: 'bg-emerald-500' }
  ];

  const sources = [
    { value: 'citizen', label: 'Citizen Reports', icon: '👤' },
    { value: 'authority', label: 'Official Reports', icon: '🏛️' },
    { value: 'news', label: 'News Sources', icon: '📰' },
    { value: 'ai', label: 'AI Detected', icon: '🤖' }
  ];

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleSeverityToggle = (severity: string) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    onFiltersChange({ ...filters, severity: newSeverity });
  };

  const handleSourceToggle = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    onFiltersChange({ ...filters, sources: newSources });
  };

  const activeFiltersCount = 
    filters.types.length + 
    filters.severity.length + 
    filters.sources.length + 
    (filters.timeRange !== '24h' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          Reset All
        </button>
      </div>

      {/* Time Range */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-medium text-slate-300">Time Range</h4>
        </div>
        <select
          value={filters.timeRange}
          onChange={(e) => onFiltersChange({ ...filters, timeRange: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {timeRanges.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Incident Types */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Tag className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-medium text-slate-300">Incident Types</h4>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {incidentTypes.map(type => (
            <label key={type.value} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-slate-700/50">
              <input
                type="checkbox"
                checked={filters.types.includes(type.value)}
                onChange={() => handleTypeToggle(type.value)}
                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
              />
              <span className="text-lg">{type.icon}</span>
              <div className="flex-1">
                <span className="text-sm text-slate-300">{type.label}</span>
                <span className="text-xs text-slate-500 ml-1">({type.count})</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Severity Levels */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-medium text-slate-300">Risk Levels</h4>
        </div>
        <div className="space-y-2">
          {severityLevels.map(level => (
            <label key={level.value} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-slate-700/50">
              <input
                type="checkbox"
                checked={filters.severity.includes(level.value)}
                onChange={() => handleSeverityToggle(level.value)}
                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
              />
              <div className={`w-3 h-3 rounded-full ${level.bgColor}`}></div>
              <span className={`text-sm ${level.color} flex-1`}>{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-medium text-slate-300">Data Sources</h4>
        </div>
        <div className="space-y-2">
          {sources.map(source => (
            <label key={source.value} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-slate-700/50">
              <input
                type="checkbox"
                checked={filters.sources.includes(source.value)}
                onChange={() => handleSourceToggle(source.value)}
                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
              />
              <span className="text-lg">{source.icon}</span>
              <span className="text-sm text-slate-300 flex-1">{source.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <button
            onClick={() => onFiltersChange({ 
              ...filters, 
              severity: ['high'], 
              timeRange: '24h' 
            })}
            className="w-full text-left p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm hover:bg-red-500/30 transition-colors"
          >
            🚨 High Risk (24h)
          </button>
          <button
            onClick={() => onFiltersChange({ 
              ...filters, 
              types: ['emergency', 'fire', 'medical'], 
              timeRange: '6h' 
            })}
            className="w-full text-left p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-sm hover:bg-amber-500/30 transition-colors"
          >
            🆘 Emergencies (6h)
          </button>
          <button
            onClick={() => onFiltersChange({ 
              ...filters, 
              sources: ['news'], 
              timeRange: '24h' 
            })}
            className="w-full text-left p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm hover:bg-blue-500/30 transition-colors"
          >
            📰 News Events (24h)
          </button>
        </div>
      </div>
    </div>
  );
}