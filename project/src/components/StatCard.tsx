import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend: string;
  color: string;
}

export default function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${color}`}>{trend}</span>
        <span className="text-sm text-slate-400 ml-2">from last week</span>
      </div>
    </div>
  );
}