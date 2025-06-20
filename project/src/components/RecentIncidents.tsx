import React from 'react';
import { Clock, MapPin, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Incident } from '../types';

interface RecentIncidentsProps {
  incidents: Incident[];
}

export default function RecentIncidents({ incidents }: RecentIncidentsProps) {
  const getStatusIcon = (status: Incident['status']) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="space-y-4 p-6">
      {incidents.map((incident) => (
        <div key={incident.id} className="border-b border-slate-700 pb-4 last:border-b-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-white text-sm">{incident.title}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(incident.aiAnalysis.severity)}`}>
                {incident.aiAnalysis.severity}
              </span>
              {getStatusIcon(incident.status)}
            </div>
          </div>
          
          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
            {incident.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{incident.location.address || 'Location not specified'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(incident.timestamp)}</span>
              </div>
            </div>
            <span className="capitalize text-slate-400">{incident.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
}