import React from 'react';
import { Activity, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';
import { Incident, NewsItem } from '../../types';

interface MapStatsProps {
  incidents: Incident[];
  news: NewsItem[];
  filteredCount: number;
  activeLayer: string;
}

export default function MapStats({ incidents, news, filteredCount, activeLayer }: MapStatsProps) {
  const totalIncidents = incidents.length;
  const totalNews = news.length;
  const highRiskIncidents = incidents.filter(i => i.aiAnalysis.severity === 'high').length;
  const recent24h = incidents.filter(i => {
    const now = new Date();
    const incidentTime = new Date(i.timestamp);
    return (now.getTime() - incidentTime.getTime()) <= 86400000;
  }).length;

  const averageConfidence = incidents.length > 0 
    ? Math.round((incidents.reduce((sum, i) => sum + i.aiAnalysis.confidence, 0) / incidents.length) * 100)
    : 0;

  const stats = [
    {
      label: 'Total Active',
      value: filteredCount,
      icon: MapPin,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      label: 'High Risk',
      value: highRiskIncidents,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      label: 'Last 24h',
      value: recent24h,
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Avg Confidence',
      value: `${averageConfidence}%`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ];

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 p-4 shadow-xl">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="h-4 w-4 text-slate-400" />
        <h3 className="text-white font-medium">Live Statistics</h3>
        <span className="text-xs text-slate-400 capitalize">({activeLayer})</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-3 border border-opacity-30`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <span className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <div className="text-xs text-slate-300">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Data Sources:</span>
          <span>{totalIncidents} Incidents, {totalNews} News</span>
        </div>
      </div>
    </div>
  );
}