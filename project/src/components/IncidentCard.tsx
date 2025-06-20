import React from 'react';
import { MapPin, Clock, User, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { Incident } from '../types';

interface IncidentCardProps {
  incident: Incident;
}

export default function IncidentCard({ incident }: IncidentCardProps) {
  const getStatusIcon = (status: Incident['status']) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'border-green-500/50 bg-green-500/10';
      default:
        return 'border-slate-600 bg-slate-800/50';
    }
  };

  const getTypeIcon = (type: string) => {
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
    <div className={`rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-lg ${getSeverityColor(incident.aiAnalysis.severity)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(incident.type)}</span>
          <div>
            <h3 className="font-semibold text-white text-lg">{incident.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-slate-400 capitalize">{incident.type}</span>
              <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              <span className="text-xs text-slate-400 capitalize">{incident.status}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(incident.status)}
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            incident.aiAnalysis.severity === 'high' ? 'bg-red-500/20 text-red-300' :
            incident.aiAnalysis.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-green-500/20 text-green-300'
          }`}>
            {incident.aiAnalysis.severity}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm mb-4 line-clamp-3">
        {incident.description}
      </p>

      {/* AI Analysis */}
      <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">AI Analysis</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400">Threat Level:</span>
            <span className="text-white ml-1">{incident.aiAnalysis.threatLevel}/10</span>
          </div>
          <div>
            <span className="text-slate-400">Confidence:</span>
            <span className="text-white ml-1">{Math.round(incident.aiAnalysis.confidence * 100)}%</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {incident.aiAnalysis.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-slate-600/50 text-slate-300 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
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
        <div className="flex items-center space-x-1">
          <User className="h-3 w-3" />
          <span className="capitalize">{incident.reporter}</span>
        </div>
      </div>
    </div>
  );
}