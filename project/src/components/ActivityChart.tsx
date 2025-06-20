import React from 'react';
import { Activity, Calendar } from 'lucide-react';
import { Incident } from '../types';

interface ActivityChartProps {
  incidents: Incident[];
}

export default function ActivityChart({ incidents }: ActivityChartProps) {
  // Group incidents by date for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const chartData = last7Days.map(date => {
    const dayIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.timestamp);
      return incidentDate.toDateString() === date.toDateString();
    });

    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: dayIncidents.length,
      high: dayIncidents.filter(i => i.aiAnalysis.severity === 'high').length,
      medium: dayIncidents.filter(i => i.aiAnalysis.severity === 'medium').length,
      low: dayIncidents.filter(i => i.aiAnalysis.severity === 'low').length
    };
  });

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Activity Trends</h3>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        <div className="flex items-end space-x-2 h-32">
          {chartData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col justify-end h-24 space-y-1">
                {/* High severity */}
                {day.high > 0 && (
                  <div 
                    className="bg-red-500 rounded-t"
                    style={{ height: `${(day.high / maxCount) * 80}px` }}
                    title={`${day.high} high severity`}
                  ></div>
                )}
                {/* Medium severity */}
                {day.medium > 0 && (
                  <div 
                    className="bg-yellow-500"
                    style={{ height: `${(day.medium / maxCount) * 80}px` }}
                    title={`${day.medium} medium severity`}
                  ></div>
                )}
                {/* Low severity */}
                {day.low > 0 && (
                  <div 
                    className="bg-green-500 rounded-b"
                    style={{ height: `${(day.low / maxCount) * 80}px` }}
                    title={`${day.low} low severity`}
                  ></div>
                )}
                {/* Empty state */}
                {day.count === 0 && (
                  <div className="bg-slate-600 rounded h-1"></div>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-2">{day.date}</div>
              <div className="text-xs text-white font-medium">{day.count}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span className="text-slate-400">High</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded"></div>
            <span className="text-slate-400">Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded"></div>
            <span className="text-slate-400">Low</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">{incidents.length}</div>
            <div className="text-xs text-slate-400">Total Reports</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">
              {incidents.filter(i => {
                const today = new Date();
                const incidentDate = new Date(i.timestamp);
                return incidentDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <div className="text-xs text-slate-400">Today</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {((incidents.reduce((sum, i) => sum + i.aiAnalysis.confidence, 0) / incidents.length) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-400">Avg Confidence</div>
          </div>
        </div>
      </div>
    </div>
  );
}