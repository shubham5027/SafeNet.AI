import React from 'react';
import { ExternalLink, Clock, MapPin, Brain, AlertTriangle, Globe } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
}

export default function NewsCard({ news }: NewsCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'medium':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'low':
        return 'text-green-400 border-green-500/30 bg-green-500/10';
      default:
        return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
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

  const handleReadMore = () => {
    window.open(news.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all duration-200 group hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2 cursor-pointer leading-tight" onClick={handleReadMore}>
            {news.title}
          </h3>
          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <Globe className="h-3 w-3" />
              <span className="font-medium">{news.source}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(news.timestamp)}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleReadMore}
          className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded"
          title="Read full article"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <p className="text-slate-300 text-sm mb-4 line-clamp-3 leading-relaxed">
        {news.description}
      </p>

      {/* Location */}
      {news.location && (
        <div className="flex items-center space-x-1 text-xs text-slate-400 mb-3">
          <MapPin className="h-3 w-3" />
          <span>{news.location.address}</span>
        </div>
      )}

      {/* AI Analysis Tags */}
      {news.aiAnalysis.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {news.aiAnalysis.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs hover:bg-slate-600/50 transition-colors">
              #{tag}
            </span>
          ))}
          {news.aiAnalysis.tags.length > 3 && (
            <span className="px-2 py-1 bg-slate-700/30 text-slate-500 rounded text-xs">
              +{news.aiAnalysis.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(news.aiAnalysis.severity)}`}>
            {news.aiAnalysis.severity} priority
          </span>
          <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs capitalize">
            {news.category.replace('-', ' ')}
          </span>
        </div>
        
        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <Brain className="h-3 w-3" />
          <span>{Math.round(news.aiAnalysis.confidence * 100)}%</span>
        </div>
      </div>

      {/* Threat Level Indicator */}
      {news.aiAnalysis.threatLevel > 7 && (
        <div className="mt-3 flex items-center space-x-2 text-xs">
          <AlertTriangle className="h-3 w-3 text-red-400" />
          <span className="text-red-400">High threat level: {news.aiAnalysis.threatLevel}/10</span>
        </div>
      )}
    </div>
  );
}