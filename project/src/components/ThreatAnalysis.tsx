import React from 'react';
import { Brain, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { Incident } from '../types';

interface ThreatAnalysisProps {
  incidents: Incident[];
}

export default function ThreatAnalysis({ incidents }: ThreatAnalysisProps) {
  const analysisData = {
    totalProcessed: incidents.length,
    highThreat: incidents.filter(i => i.aiAnalysis.severity === 'high').length,
    averageConfidence: incidents.reduce((sum, i) => sum + i.aiAnalysis.confidence, 0) / incidents.length,
    averageThreatLevel: incidents.reduce((sum, i) => sum + i.aiAnalysis.threatLevel, 0) / incidents.length,
    typeDistribution: incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    severityTrends: {
      high: incidents.filter(i => i.aiAnalysis.severity === 'high').length,
      medium: incidents.filter(i => i.aiAnalysis.severity === 'medium').length,
      low: incidents.filter(i => i.aiAnalysis.severity === 'low').length
    }
  };

  const topIncidentType = Object.entries(analysisData.typeDistribution)
    .sort(([,a], [,b]) => b - a)[0] || ['N/A', 0];

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">AI Threat Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">{analysisData.totalProcessed}</div>
            <div className="text-sm text-slate-400">Total Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{analysisData.highThreat}</div>
            <div className="text-sm text-slate-400">High Threat</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {(analysisData.averageConfidence * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {analysisData.averageThreatLevel.toFixed(1)}/10
            </div>
            <div className="text-sm text-slate-400">Avg Threat Level</div>
          </div>
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <h4 className="text-lg font-semibold text-white">Severity Distribution</h4>
        </div>

        <div className="space-y-4">
          {Object.entries(analysisData.severityTrends).map(([severity, count]) => {
            const percentage = (count / analysisData.totalProcessed) * 100;
            const color = severity === 'high' ? 'bg-red-500' : 
                         severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
            const textColor = severity === 'high' ? 'text-red-400' : 
                             severity === 'medium' ? 'text-yellow-400' : 'text-green-400';

            return (
              <div key={severity}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium capitalize ${textColor}`}>
                    {severity} Risk
                  </span>
                  <span className="text-sm text-slate-300">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident Type Analysis */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <h4 className="text-lg font-semibold text-white">Incident Categories</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(analysisData.typeDistribution).map(([type, count]) => {
            const percentage = (count / analysisData.totalProcessed) * 100;
            const icons = {
              crime: '🚨',
              emergency: '🆘',
              suspicious: '👁️',
              traffic: '🚗',
              fire: '🔥',
              medical: '🏥'
            };
            const icon = icons[type as keyof typeof icons] || '📍';

            return (
              <div key={type} className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-lg font-bold text-white">{count}</div>
                <div className="text-xs text-slate-400 capitalize">{type}</div>
                <div className="text-xs text-slate-500">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-purple-400" />
          <h4 className="text-lg font-semibold text-white">Key Insights</h4>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
            <p className="text-slate-300">
              <strong className="text-white">Most Common Incident:</strong> {topIncidentType[0]} 
              ({topIncidentType[1]} reports, {((topIncidentType[1] / analysisData.totalProcessed) * 100).toFixed(1)}%)
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <p className="text-slate-300">
              <strong className="text-white">AI Confidence:</strong> Average confidence level of {(analysisData.averageConfidence * 100).toFixed(1)}% 
              indicates reliable threat assessment
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
            <p className="text-slate-300">
              <strong className="text-white">Risk Distribution:</strong> {analysisData.severityTrends.high} high-risk incidents 
              require immediate attention ({((analysisData.severityTrends.high / analysisData.totalProcessed) * 100).toFixed(1)}% of total)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}