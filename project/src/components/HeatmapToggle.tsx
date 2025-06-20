import React from 'react';
import { Layers } from 'lucide-react';

interface HeatmapToggleProps {
  showHeatmap: boolean;
  onToggle: (show: boolean) => void;
}

export default function HeatmapToggle({ showHeatmap, onToggle }: HeatmapToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Layers className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-300">Heatmap View</span>
      </div>
      <button
        onClick={() => onToggle(!showHeatmap)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          showHeatmap ? 'bg-blue-600' : 'bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            showHeatmap ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}