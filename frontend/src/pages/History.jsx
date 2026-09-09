import React, { useState, useEffect } from 'react';
import { formatINR } from '../utils/formatters';
import api from '../services/api';
import { History as HistoryIcon, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/analytics/history');
        setHistory(res.data.history || []);
      } catch (err) {
        console.error('Failed to fetch monthly history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-cyan-400" />
          Monthly Financial History & Behavior Trends
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your salary growth, category allocations, and actual spending patterns over time
        </p>
      </div>

      {/* History Trend Chart */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-md font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Salary & Spending Growth Trajectory
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip
                formatter={(val) => formatINR(val)}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
              />
              <Line type="monotone" dataKey="salary" name="Salary" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="total_spent" name="Total Spent" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="savings_potential" name="Savings Potential" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly History Records Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-md font-bold text-white">Monthly Allocation Records</h3>

        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No historical records yet. Update your monthly salary on the dashboard to build your history log!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Month</th>
                  <th className="p-3">Salary</th>
                  <th className="p-3 text-emerald-400">Home (35%)</th>
                  <th className="p-3 text-cyan-400">Invest (25%)</th>
                  <th className="p-3 text-amber-400">Emergency (10%)</th>
                  <th className="p-3 text-indigo-400">Travel (15%)</th>
                  <th className="p-3 text-rose-400">Personal (15%)</th>
                  <th className="p-3 text-right">Actual Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {history.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold text-white font-mono">{rec.month}</td>
                    <td className="p-3 font-extrabold text-cyan-400">{formatINR(rec.salary)}</td>
                    <td className="p-3">{formatINR(rec.home)}</td>
                    <td className="p-3">{formatINR(rec.investment)}</td>
                    <td className="p-3">{formatINR(rec.emergency)}</td>
                    <td className="p-3">{formatINR(rec.travel)}</td>
                    <td className="p-3">{formatINR(rec.personal)}</td>
                    <td className="p-3 text-right font-bold text-rose-400">{formatINR(rec.total_spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
