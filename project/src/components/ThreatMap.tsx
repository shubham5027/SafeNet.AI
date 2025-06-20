import React from 'react';
import { Incident } from '../types';

interface ThreatMapProps {
  incidents: Incident[];
}

export default function ThreatMap({ incidents }: ThreatMapProps) {
  const threatLevels = {
    high: incidents.filter(i => i.aiAnalysis.severity === 'high').length,
    medium: incidents.filter(i => i.aiAnalysis.severity === 'medium').length,
    low: incidents.filter(i => i.aiAnalysis.severity === 'low').length
  };

  const total = incidents.length;
  const highPercentage = total > 0 ? (threatLevels.high / total) * 100 : 0;
  const mediumPercentage = total > 0 ? (threatLevels.medium / total) * 100 : 0;
  const lowPercentage = total > 0 ? (threatLevels.low / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Threat Level Distribution */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Threat Level Distribution</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-slate-300">High Threat</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white font-medium">{threatLevels.high}</span>
              <span className="text-xs text-slate-400">({Math.round(highPercentage)}%)</span>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${highPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-slate-300">Medium Threat</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white font-medium">{threatLevels.medium}</span>
              <span className="text-xs text-slate-400">({Math.round(mediumPercentage)}%)</span>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${mediumPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">Low Threat</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white font-medium">{threatLevels.low}</span>
              <span className="text-xs text-slate-400">({Math.round(lowPercentage)}%)</span>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${lowPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Mock Geographic Visualization */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Geographic Overview</h3>
        <div className="bg-slate-700/30 rounded-lg p-6 text-center">
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {incidents.slice(0, 9).map((incident, index) => (
              <div
                key={incident.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  incident.aiAnalysis.severity === 'high'
                    ? 'bg-red-500 text-white'
                    : incident.aiAnalysis.severity === 'medium'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-green-500 text-white'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-4">
            Simplified geographic representation of recent incidents
          </p>
        </div>
      </div>
    </div>
  );
}