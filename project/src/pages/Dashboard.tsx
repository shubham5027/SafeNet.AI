import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Newspaper, Brain, Users, TrendingUp, Activity, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import RecentIncidents from '../components/RecentIncidents';
import ThreatMap from '../components/ThreatMap';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function Dashboard() {
  const { incidents, news } = useApp();

  // Personalized Safety Tip state
  const [safetyTip, setSafetyTip] = useState<string | null>(null);
  const [tipLoading, setTipLoading] = useState(false);

  useEffect(() => {
    async function fetchTip() {
      setTipLoading(true);
      try {
        const context = incidents && incidents.length > 0
          ? `Recent incidents: ${incidents.slice(0, 3).map(i => i.title + ' - ' + i.type).join('; ')}`
          : 'No recent incidents reported.';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Given the following user context, provide a short, actionable safety tip (1-2 sentences) for the user. Context: ${context}`
                    }
                  ]
                }
              ]
            }),
          }
        );
        const data = await res.json();
        setSafetyTip(data.candidates?.[0]?.content?.parts?.[0]?.text || null);
      } catch {
        setSafetyTip(null);
      } finally {
        setTipLoading(false);
      }
    }
    fetchTip();
  }, [incidents]);

  const stats = [
    {
      title: 'Active Incidents',
      value: incidents.filter(i => i.status === 'pending').length,
      icon: AlertTriangle,
      trend: '+12%',
      color: 'text-red-400'
    },
    {
      title: 'Verified Reports',
      value: incidents.filter(i => i.status === 'verified').length,
      icon: Shield,
      trend: '+8%',
      color: 'text-green-400'
    },
    {
      title: 'News Updates',
      value: news.length,
      icon: Newspaper,
      trend: '+25%',
      color: 'text-blue-400'
    },
    {
      title: 'AI Processed',
      value: incidents.length + news.length,
      icon: Brain,
      trend: '+18%',
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Personalized Safety Tip */}
      <div className="mb-6">
        <div className="bg-blue-900/80 border border-blue-500/30 rounded-lg p-4 flex items-center gap-3">
          <span role="img" aria-label="tip" className="text-2xl">💡</span>
          <div>
            <div className="text-blue-200 font-semibold">Personalized Safety Tip</div>
            <div className="text-blue-100 text-sm">
              {tipLoading ? 'Loading tip...' : (safetyTip || 'Stay alert and stay safe!')}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">SafeNet.AI Dashboard</h1>
        <p className="text-slate-400">Real-time civic safety intelligence and incident monitoring</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/report"
          className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-6 hover:from-red-500/30 hover:to-red-600/30 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-400 group-hover:text-red-300" />
            <div>
              <h3 className="text-lg font-semibold text-white">Report Incident</h3>
              <p className="text-slate-400 text-sm">Submit safety concerns or emergencies</p>
            </div>
          </div>
        </Link>

        <Link
          to="/map"
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6 hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8 text-blue-400 group-hover:text-blue-300" />
            <div>
              <h3 className="text-lg font-semibold text-white">Safety Map</h3>
              <p className="text-slate-400 text-sm">View real-time incident mapping</p>
            </div>
          </div>
        </Link>

        <Link
          to="/intelligence"
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6 hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-purple-400 group-hover:text-purple-300" />
            <div>
              <h3 className="text-lg font-semibold text-white">AI Intelligence</h3>
              <p className="text-slate-400 text-sm">Access threat analysis and insights</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Incidents */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Incidents</h2>
              <Link to="/intelligence" className="text-blue-400 hover:text-blue-300 text-sm">
                View All →
              </Link>
            </div>
          </div>
          <RecentIncidents incidents={incidents.slice(0, 5)} />
        </div>

        {/* Threat Level Map */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Threat Level Overview</h2>
          </div>
          <div className="p-6">
            <ThreatMap incidents={incidents} />
          </div>
        </div>
      </div>
    </div>
  );
}