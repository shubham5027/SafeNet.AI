import React from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';

interface MapFiltersProps {
  filters: {
    types: string[];
    timeRange: string;
    severity: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export default function MapFilters({ filters, onFiltersChange }: MapFiltersProps) {
  const incidentTypes = [
    { value: 'crime', label: 'Crime', icon: '🚨' },
    { value: 'emergency', label: 'Emergency', icon: '🆘' },
    { value: 'suspicious', label: 'Suspicious', icon: '👁️' },
    { value: 'traffic', label: 'Traffic', icon: '🚗' },
    { value: 'fire', label: 'Fire', icon: '🔥' },
    { value: 'medical', label: 'Medical', icon: '🏥' }
  ];

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const severityLevels = [
    { value: 'high', label: 'High Risk', color: 'text-red-400' },
    { value: 'medium', label: 'Medium Risk', color: 'text-yellow-400' },
    { value: 'low', label: 'Low Risk', color: 'text-green-400' }
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

  return (
    <div className="space-y-6">
      {/* Time Range */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">Time Range</h3>
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
          <h3 className="text-sm font-medium text-slate-300">Incident Types</h3>
        </div>
        <div className="space-y-2">
          {incidentTypes.map(type => (
            <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.types.includes(type.value)}
                onChange={() => handleTypeToggle(type.value)}
                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
              />
              <span className="text-lg">{type.icon}</span>
              <span className="text-sm text-slate-300">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Severity Levels */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">Threat Levels</h3>
        </div>
        <div className="space-y-2">
          {severityLevels.map(level => (
            <label key={level.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.severity.includes(level.value)}
                onChange={() => handleSeverityToggle(level.value)}
                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
              />
              <div className={`w-3 h-3 rounded-full ${
                level.value === 'high' ? 'bg-red-500' :
                level.value === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className={`text-sm ${level.color}`}>{level.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}