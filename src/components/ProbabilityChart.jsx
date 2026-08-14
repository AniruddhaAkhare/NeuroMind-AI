import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { formatClassName } from '../utils/helpers';

export default function ProbabilityChart({ probabilities }) {
  if (!probabilities) return null;

  const chartData = [
    { key: 'NonDemented', label: 'Non-Demented', prob: probabilities.NonDemented || 0, color: '#10b981' },
    { key: 'VeryMildDemented', label: 'Very Mild', prob: probabilities.VeryMildDemented || 0, color: '#f59e0b' },
    { key: 'MildDemented', label: 'Mild Demented', prob: probabilities.MildDemented || 0, color: '#f97316' },
    { key: 'ModerateDemented', label: 'Moderate', prob: probabilities.ModerateDemented || 0, color: '#f43f5e' },
  ].map((item) => ({
    ...item,
    percentage: parseFloat((item.prob * 100).toFixed(2)),
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-4">
      <div>
        <h3 className="font-semibold text-lg text-white">Class Probability Distribution</h3>
        <p className="text-xs text-slate-400">Software inference output across all 4 candidate dementia stages</p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Probability']}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
            />
            <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
        {chartData.map((item) => (
          <div key={item.key} className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block truncate">{item.label}</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
