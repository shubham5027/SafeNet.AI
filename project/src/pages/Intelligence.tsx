import { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, BarChart3, PieChart, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import IncidentCard from '../components/IncidentCard';
import ThreatAnalysis from '../components/ThreatAnalysis';
import ActivityChart from '../components/ActivityChart';

export default function Intelligence() {
  const { incidents } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'threats', label: 'Threat Analysis', icon: AlertTriangle },
    { id: 'incidents', label: 'All Incidents', icon: Activity },
    { id: 'patterns', label: 'Patterns', icon: TrendingUp }
  ];

  const aiInsights = {
    totalIncidents: incidents.length,
    highThreatIncidents: incidents.filter(i => i.aiAnalysis.severity === 'high').length,
    averageConfidence: incidents.reduce((sum, i) => sum + i.aiAnalysis.confidence, 0) / incidents.length,
    topThreatType: incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentTrends: [
      { period: 'Last 24h', incidents: incidents.filter(i => 
        new Date().getTime() - new Date(i.timestamp).getTime() < 86400000
      ).length },
      { period: 'Last 7d', incidents: incidents.filter(i => 
        new Date().getTime() - new Date(i.timestamp).getTime() < 604800000
      ).length },
    ]
  };

  const topThreatTypeEntry = Object.entries(aiInsights.topThreatType).sort(([,a], [,b]) => b - a)[0];
  const topThreatType = topThreatTypeEntry ? topThreatTypeEntry[0] : 'N/A';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">AI Intelligence Dashboard</h1>
        </div>
        <p className="text-slate-400">Advanced threat analysis and pattern recognition for public safety</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 mb-8">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* AI Insights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total Processed</p>
                  <p className="text-2xl font-bold text-white">{aiInsights.totalIncidents}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm font-medium">High Threat</p>
                  <p className="text-2xl font-bold text-white">{aiInsights.highThreatIncidents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Avg Confidence</p>
                  <p className="text-2xl font-bold text-white">{(aiInsights.averageConfidence * 100).toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Top Category</p>
                  <p className="text-2xl font-bold text-white capitalize">{topThreatType}</p>
                </div>
                <PieChart className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ActivityChart incidents={incidents} />
            <ThreatAnalysis incidents={incidents} />
          </div>
        </div>
      )}

      {activeTab === 'threats' && <ThreatAnalysis incidents={incidents} />}

      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">All Incidents</h2>
            <div className="text-sm text-slate-400">
              {incidents.length} total incidents
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {incidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8 text-center">
          <TrendingUp className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Pattern Analysis</h3>
          <p className="text-slate-400">
            Advanced pattern recognition and predictive analytics coming soon. 
            This feature will identify crime hotspots, temporal patterns, and risk predictions.
          </p>
        </div>
      )}
    </div>
  );
}