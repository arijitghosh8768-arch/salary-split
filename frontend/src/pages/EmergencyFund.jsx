import React, { useState, useEffect } from 'react';
import { formatINR } from '../utils/formatters';
import api from '../services/api';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Building2, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  Award,
  Sparkles
} from 'lucide-react';

export default function EmergencyFund() {
  const [essentialExpenses, setEssentialExpenses] = useState(20000);
  const [currentSaved, setCurrentSaved] = useState(35000);
  const [salaryRuleData, setSalaryRuleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salRes = await api.get('/salary');
        setSalaryRuleData(salRes.data);
      } catch (err) {
        console.error('Failed to fetch salary data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthlySalary = salaryRuleData?.salary || 50000;
  const monthlyAdd = salaryRuleData?.calculation?.allocations?.emergency?.amount || (monthlySalary * 0.10);

  // 1. 6-Month Essential Expense Safety Net Target
  const target6Month = essentialExpenses * 6;
  const progress6MonthPct = target6Month > 0 ? Math.min(100, Math.round((currentSaved / target6Month) * 1000) / 10) : 0;
  const remaining6Month = Math.max(0, target6Month - currentSaved);
  const monthsNeeded6Month = monthlyAdd > 0 ? Math.ceil(remaining6Month / monthlyAdd) : 0;

  // 2. 3-Year (36-Month) Extended Corpus Target & 40% Soft Limit
  const target3Year = essentialExpenses * 36;
  const softLimit40Pct = target3Year * 0.40; // 40% Soft Limit threshold
  const progress3YearPct = target3Year > 0 ? Math.min(100, Math.round((currentSaved / target3Year) * 1000) / 10) : 0;
  const remaining3Year = Math.max(0, target3Year - currentSaved);
  const monthsNeeded3Year = monthlyAdd > 0 ? Math.ceil(remaining3Year / monthlyAdd) : 0;

  const isSoftLimitReached = currentSaved >= softLimit40Pct;
  const softLimitDeficit = Math.max(0, softLimit40Pct - currentSaved);
  const monthsNeededSoftLimit = monthlyAdd > 0 ? Math.ceil(softLimitDeficit / monthlyAdd) : 0;

  // 3-Layer Emergency Allocation Strategy
  const layer1Savings = Math.min(currentSaved, 25000);
  const remainingAfterL1 = Math.max(0, currentSaved - layer1Savings);
  const layer2SweepFD = Math.min(remainingAfterL1, 60000);
  const layer3LiquidMF = Math.max(0, remainingAfterL1 - layer2SweepFD);

  // Indian Financial Instruments Comparison
  const instruments = [
    {
      name: '🏦 Savings Account',
      safety: 'Very High*',
      access: 'Instant (24/7 ATM/UPI)',
      returnPotential: 'Low (2.7% - 3.5%)',
      view: 'Best for Layer 1 (Immediate Today Emergencies)',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      name: '🔄 Sweep-in FD / Short FD',
      safety: 'Very High*',
      access: 'Very Easy (Auto-break)',
      returnPotential: 'Better than savings (6.5% - 7.2%)',
      view: 'Excellent for Layer 2 (Primary Bulk Buffer)',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    {
      name: '🧾 Liquid / Overnight MF',
      safety: 'Market-linked',
      access: 'Quick (T+1 Business Day)',
      returnPotential: 'Moderate (6.0% - 6.8%)',
      view: 'Good Second Layer (SEBI Regulated Categories)',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    {
      name: '📈 Equity MF / Direct Stocks',
      safety: 'High Volatility',
      access: 'Quick to sell (T+1)',
      returnPotential: 'High (Variable)',
      view: '❌ NOT for Emergency Fund (Capital Risk in Crash)',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      name: '🪙 Gold / Digital Gold',
      safety: 'Volatile Price',
      access: 'Quick-ish',
      returnPotential: 'Variable',
      view: '❌ NOT Primary Emergency Fund',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Safety + Liquidity Driven Strategy
        </div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-amber-400" />
          Emergency Fund Module
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          "Emergency money should be boring. Priority is safety + liquidity, calculated from essential monthly expenses."
        </p>
      </div>

      {/* Target & Calculator Inputs */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Monthly Essential Expense (Rent, Food, EMI)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={essentialExpenses}
            onChange={(e) => setEssentialExpenses(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Current Saved Emergency Balance (₹)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={currentSaved}
            onChange={(e) => setCurrentSaved(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Monthly 10% Contribution from Salary
          </label>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-black text-cyan-400">
            {formatINR(monthlyAdd)} / month
          </div>
        </div>
      </div>

      {/* Dual Emergency Target Cards (6-Month vs 3-Year with 40% Soft Limit) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: 6-Month Emergency Target */}
        <div className="glass-card p-8 rounded-3xl border border-amber-500/30 space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                6-Month Essential Safety Net
              </span>
              <span className="text-3xl font-black text-amber-400">{progress6MonthPct}%</span>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Target 6-Month Goal (Essential Expenses × 6)</p>
              <h2 className="text-3xl font-black text-white mt-1">
                {formatINR(currentSaved)} <span className="text-base text-slate-400 font-normal">/ {formatINR(target6Month)}</span>
              </h2>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all shadow-lg shadow-amber-500/30"
                  style={{ width: `${progress6MonthPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Deficit: {formatINR(remaining6Month)}</span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Clock className="w-3.5 h-3.5" /> Est. {monthsNeeded6Month} months ({formatINR(monthlyAdd)}/mo)
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            💡 Covers 6 months of essential living expenses (Rent, Food, Medical, EMIs). Achieved in approximately {monthsNeeded6Month} months.
          </div>
        </div>

        {/* Card 2: 3-Year Extended Corpus with 40% Soft Limit */}
        <div className="glass-card p-8 rounded-3xl border border-cyan-500/30 space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-extrabold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                3-Year (36-Month) Extended Corpus
              </span>
              <span className="text-3xl font-black text-cyan-400">{progress3YearPct}%</span>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Full 3-Year Target (Essential Expenses × 36)</p>
              <h2 className="text-3xl font-black text-white mt-1">
                {formatINR(currentSaved)} <span className="text-base text-slate-400 font-normal">/ {formatINR(target3Year)}</span>
              </h2>
            </div>

            {/* 40% Soft Limit Badge */}
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              isSoftLimitReached
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900/90 border-cyan-500/30 text-cyan-300'
            }`}>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="font-bold">40% Soft Limit Milestone:</span> {formatINR(softLimit40Pct)}
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                    {isSoftLimitReached ? '🎉 40% Milestone Achieved! Further funding up to 100% is optional.' : `Remaining to 40% soft limit: ${formatINR(softLimitDeficit)} (~${monthsNeededSoftLimit} mos)`}
                  </p>
                </div>
              </div>
              {isSoftLimitReached && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase">
                  Achieved ✅
                </span>
              )}
            </div>

            {/* Progress Bar with 40% Marker */}
            <div className="space-y-2 relative">
              <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all shadow-lg shadow-cyan-500/30"
                  style={{ width: `${progress3YearPct}%` }}
                />
              </div>

              {/* 40% soft limit visual line marker */}
              <div
                className="absolute top-0 bottom-6 w-0.5 bg-yellow-400/80 border-r border-yellow-300 pointer-events-none"
                style={{ left: '40%' }}
                title="40% Soft Limit Threshold"
              />

              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>40% Threshold: {formatINR(softLimit40Pct)}</span>
                <span className="flex items-center gap-1 text-cyan-300">
                  <Clock className="w-3.5 h-3.5" /> Full 100%: {monthsNeeded3Year} mos
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            🛡️ <span className="font-bold text-cyan-400">Soft Limit Rule:</span> Reaching 40% ({formatINR(softLimit40Pct)}) completes the baseline recommended protection. After 40%, continuing towards 100% ({formatINR(target3Year)}) is completely optional based on your choice!
          </div>
        </div>
      </div>

      {/* 🥇 3-Layer Emergency Allocation Breakdown */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            🥇 Recommended 3-Layer Emergency Fund Structure
          </h3>
          <span className="text-xs text-slate-400">Optimizing Safety + Liquidity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                Layer 1: Immediate
              </span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Savings Account</h4>
              <p className="text-2xl font-black text-emerald-400 mt-1">{formatINR(layer1Savings)}</p>
              <p className="text-[11px] text-slate-400 mt-1">Target: ₹20,000 – ₹30,000</p>
            </div>
            <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">
              ⚡ For emergencies happening <strong>today</strong> (Instant ATM/UPI access).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                Layer 2: Bulk Buffer
              </span>
              <RefreshCw className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Sweep-in FD / Short FD</h4>
              <p className="text-2xl font-black text-cyan-400 mt-1">{formatINR(layer2SweepFD)}</p>
              <p className="text-[11px] text-slate-400 mt-1">Target: ₹50,000 – ₹70,000</p>
            </div>
            <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">
              🔄 Very high safety with auto-break features and better yields than savings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase">
                Layer 3: Extended Buffer
              </span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Liquid / Overnight MF</h4>
              <p className="text-2xl font-black text-indigo-400 mt-1">{formatINR(layer3LiquidMF)}</p>
              <p className="text-[11px] text-slate-400 mt-1">Remaining corpus allocation</p>
            </div>
            <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">
              🧾 SEBI regulated category providing quick T+1 business day redemption.
            </p>
          </div>
        </div>
      </div>

      {/* Indian Financial Instruments Comparison Matrix */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Indian Financial Instruments Comparison (Safety + Access)
          </h3>
          <span className="text-[11px] text-slate-400">Ref: SEBI Mutual Fund Category Standards</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Instrument Category</th>
                <th className="p-3">Capital Safety</th>
                <th className="p-3">Access & Liquidity</th>
                <th className="p-3">Return Potential</th>
                <th className="p-3">Recommendation / Strategy View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {instruments.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-white">{item.name}</td>
                  <td className="p-3 font-semibold">{item.safety}</td>
                  <td className="p-3 text-slate-300">{item.access}</td>
                  <td className="p-3 text-slate-300">{item.returnPotential}</td>
                  <td className="p-3 font-medium">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] border font-bold ${item.color}`}>
                      {item.view}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-500 pt-2">
          *Bank deposit safety depends on the bank and applicable DICGC deposit insurance rules up to ₹5 Lakhs per bank.
        </p>
      </div>
    </div>
  );
}
