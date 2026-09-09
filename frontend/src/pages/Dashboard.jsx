import React, { useState, useEffect } from 'react';
import { formatINR, CATEGORY_COLORS } from '../utils/formatters';
import api from '../services/api';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  Wallet, 
  PlusCircle, 
  Sliders, 
  ArrowUpRight, 
  ShieldAlert, 
  Target, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export default function Dashboard({ onOpenRuleModal }) {
  const [salaryInput, setSalaryInput] = useState('50000');
  const [monthInput, setMonthInput] = useState(new Date().toISOString().substring(0, 7));
  const [data, setData] = useState(null);
  const [expenseData, setExpenseData] = useState({ categoryTotals: {}, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [savingSalary, setSavingSalary] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [salaryRes, expenseRes] = await Promise.all([
        api.get('/salary'),
        api.get(`/expenses?month=${monthInput}`)
      ]);

      setData(salaryRes.data);
      if (salaryRes.data.salary) {
        setSalaryInput(String(salaryRes.data.salary));
      }
      setExpenseData(expenseRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [monthInput]);

  const handleSalarySave = async (e) => {
    e.preventDefault();
    setSavingSalary(true);
    setSaveSuccess(false);
    try {
      const res = await api.post('/salary', {
        salary: Number(salaryInput),
        month: monthInput
      });
      setData(prev => ({
        ...prev,
        salary: Number(salaryInput),
        calculation: res.data.calculation
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save salary:', err);
    } finally {
      setSavingSalary(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">Loading SalarySplit Dashboard...</span>
        </div>
      </div>
    );
  }

  const calc = (data && data.calculation && data.calculation.allocations) ? data.calculation : {
    allocations: {
      home: { amount: 17500, percentage: 35 },
      investment: { amount: 12500, percentage: 25 },
      emergency: { amount: 5000, percentage: 10 },
      travel: { amount: 7500, percentage: 15 },
      personal: { amount: 7500, percentage: 15 }
    },
    totalAllocated: Number(salaryInput) || 50000
  };

  const currentSalary = Number(salaryInput) || 50000;
  const categoryTotals = expenseData.categoryTotals || {};
  const totalSpent = expenseData.totalSpent || 0;
  const remainingTotal = currentSalary - totalSpent;

  // Pie chart data
  const chartData = [
    { name: 'Home Expense', value: calc.allocations.home.amount, color: CATEGORY_COLORS.home.hex, key: 'home' },
    { name: 'Investment', value: calc.allocations.investment.amount, color: CATEGORY_COLORS.investment.hex, key: 'investment' },
    { name: 'Emergency Fund', value: calc.allocations.emergency.amount, color: CATEGORY_COLORS.emergency.hex, key: 'emergency' },
    { name: 'Car / Travel', value: calc.allocations.travel.amount, color: CATEGORY_COLORS.travel.hex, key: 'travel' },
    { name: 'Personal Expense', value: calc.allocations.personal.amount, color: CATEGORY_COLORS.personal.hex, key: 'personal' },
  ];

  // Target vs Actual bar chart data
  const barChartData = [
    { name: 'Home', Target: calc.allocations.home.amount, Spent: categoryTotals.home || 0 },
    { name: 'Invest', Target: calc.allocations.investment.amount, Spent: categoryTotals.investment || 0 },
    { name: 'Emergency', Target: calc.allocations.emergency.amount, Spent: categoryTotals.emergency || 0 },
    { name: 'Travel', Target: calc.allocations.travel.amount, Spent: categoryTotals.travel || 0 },
    { name: 'Personal', Target: calc.allocations.personal.amount, Spent: categoryTotals.personal || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header & Salary Input Section */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Budget Allocation Engine Active
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Salary Allocation Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Rule Applied: <span className="text-cyan-400 font-semibold">{calc.allocations.home.percentage}/{calc.allocations.investment.percentage}/{calc.allocations.emergency.percentage}/{calc.allocations.travel.percentage}/{calc.allocations.personal.percentage}</span> (Home / Invest / Emergency / Travel / Personal)
          </p>
        </div>

        <form onSubmit={handleSalarySave} className="flex flex-wrap items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Select Month
            </label>
            <input
              type="month"
              value={monthInput}
              onChange={(e) => setMonthInput(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Monthly Salary (₹)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              placeholder="e.g. 50000"
              className="w-36 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="self-end">
            <button
              type="submit"
              disabled={savingSalary}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingSalary ? 'Saving...' : 'Update Salary'}
              {saveSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
            </button>
          </div>

          <div className="self-end">
            <button
              type="button"
              onClick={onOpenRuleModal}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Edit Rule %"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </form>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Monthly Salary</p>
            <p className="text-3xl font-black text-white mt-1">{formatINR(currentSalary)}</p>
            <p className="text-xs text-cyan-400 mt-1">100% Allocated</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actual Spent ({monthInput})</p>
            <p className="text-3xl font-black text-rose-400 mt-1">{formatINR(totalSpent)}</p>
            <p className="text-xs text-slate-400 mt-1">
              {currentSalary > 0 ? `${((totalSpent / currentSalary) * 100).toFixed(1)}% of salary spent` : '0%'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Unspent Balance</p>
            <p className={`text-3xl font-black mt-1 ${remainingTotal >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              {formatINR(remainingTotal)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Available for savings / rollover</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 5 Allocation Category Cards */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
          <span>Rule Breakdown ({calc.allocations.home.percentage}% / {calc.allocations.investment.percentage}% / {calc.allocations.emergency.percentage}% / {calc.allocations.travel.percentage}% / {calc.allocations.personal.percentage}%)</span>
          <span className="text-xs font-normal text-slate-400">Target Allocation vs Actual Spent</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(calc.allocations).map(([key, item]) => {
            const config = CATEGORY_COLORS[key] || CATEGORY_COLORS.personal;
            const spent = categoryTotals[key] || 0;
            const remaining = item.amount - spent;
            const pctSpent = item.amount > 0 ? Math.min(100, Math.round((spent / item.amount) * 100)) : 0;

            return (
              <div key={key} className={`glass-card glass-card-hover p-5 rounded-2xl border ${config.border} flex flex-col justify-between space-y-4`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                    {item.percentage}% Allocation
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{key}</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{config.label}</h3>
                  <p className="text-2xl font-black text-white mt-1">{formatINR(item.amount)}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Spent:</span>
                    <span className="font-semibold text-slate-200">{formatINR(spent)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Remaining:</span>
                    <span className={`font-semibold ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatINR(remaining)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 mt-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pctSpent > 100 ? 'bg-rose-500' : config.text.replace('text-', 'bg-')
                      }`}
                      style={{ width: `${pctSpent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 text-right font-medium">
                    {pctSpent}% Used
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Charts: Donut Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie/Donut Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Allocation Share Donut
            </h3>
            <span className="text-xs text-slate-400">Monthly Split Breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => formatINR(val)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {chartData.map(item => (
              <div key={item.key} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="truncate">
                  <p className="text-slate-300 font-medium truncate">{item.name}</p>
                  <p className="text-slate-400 font-bold">{formatINR(item.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target vs Actual Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Target vs Actual Spending
            </h3>
            <span className="text-xs text-slate-400">{monthInput} Comparison</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val) => formatINR(val)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Bar dataKey="Target" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-600" />
              <span className="text-slate-300">Target Allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-rose-500" />
              <span className="text-slate-300">Actual Spent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
