import React, { useState, useEffect } from 'react';
import { formatINR } from '../utils/formatters';
import api from '../services/api';
import { TrendingUp, Plus, Trash2, PieChart as PieIcon, CheckCircle2, DollarSign } from 'lucide-react';

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalMonthlyContribution, setTotalMonthlyContribution] = useState(0);
  const [breakdown, setBreakdown] = useState({});
  const [salaryRuleData, setSalaryRuleData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [assetType, setAssetType] = useState('Mutual Funds');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [monthlyContrib, setMonthlyContrib] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInvestmentData = async () => {
    try {
      setLoading(true);
      const [invRes, salRes] = await Promise.all([
        api.get('/investments'),
        api.get('/salary')
      ]);

      setInvestments(invRes.data.investments || []);
      setTotalInvested(invRes.data.totalInvested || 0);
      setTotalMonthlyContribution(invRes.data.totalMonthlyContribution || 0);
      setBreakdown(invRes.data.breakdownByAsset || {});
      setSalaryRuleData(salRes.data);
    } catch (err) {
      console.error('Failed to load investment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestmentData();
  }, []);

  const handleAddInvestment = async (e) => {
    e.preventDefault();
    if (!name || !amount || Number(amount) < 0) return;

    setSubmitting(true);
    try {
      await api.post('/investments', {
        asset_type: assetType,
        name,
        amount: Number(amount),
        monthly_contribution: Number(monthlyContrib) || 0,
        notes
      });

      setName('');
      setAmount('');
      setMonthlyContrib('');
      setNotes('');
      fetchInvestmentData();
    } catch (err) {
      console.error('Failed to add investment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/investments/${id}`);
      fetchInvestmentData();
    } catch (err) {
      console.error('Failed to delete investment:', err);
    }
  };

  const monthlyTarget = salaryRuleData?.calculation?.allocations?.investment?.amount || 12500;
  const pctGoalReached = monthlyTarget > 0 ? Math.min(100, Math.round((totalMonthlyContribution / monthlyTarget) * 100)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-cyan-400" />
          Investment Portfolio & Target Tracking (25%)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your Mutual Funds, SIPs, Stocks, ETFs, Gold & FD allocations
        </p>
      </div>

      {/* Target Progress Banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Investment Target (25% Rule)</p>
            <p className="text-2xl font-black text-white mt-1">
              {formatINR(totalMonthlyContribution)} / {formatINR(monthlyTarget)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-cyan-400">{pctGoalReached}%</span>
            <p className="text-xs text-slate-400">Target Progress</p>
          </div>
        </div>

        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
            style={{ width: `${pctGoalReached}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Investment Input Form */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5 h-fit">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            Add Investment Instrument
          </h3>

          <form onSubmit={handleAddInvestment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Asset Category</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Mutual Funds">Mutual Funds (SIP)</option>
                <option value="Stocks">Direct Stocks</option>
                <option value="ETF">ETFs</option>
                <option value="Gold">Sovereign Gold / Digital Gold</option>
                <option value="FD/RD">Fixed Deposit / Recurring Deposit</option>
                <option value="Other">Other Investment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Asset / Fund Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Parag Parikh Flexi Cap Fund"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Total Current Value (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Monthly SIP / Contribution (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlyContrib}
                onChange={(e) => setMonthlyContrib(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Notes / Folio No.</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Adding...' : 'Add Investment Record'}
            </button>
          </form>
        </div>

        {/* Investment List & Portfolio Value */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold text-white">Investment Holdings</h3>
                <p className="text-xs text-slate-400">Total Portfolio Value: <span className="text-emerald-400 font-bold text-sm">{formatINR(totalInvested)}</span></p>
              </div>
            </div>

            {investments.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No investment assets added yet. Track your SIPs and stocks above!
              </div>
            ) : (
              <div className="space-y-3">
                {investments.map(inv => (
                  <div key={inv.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {inv.asset_type}
                        </span>
                        <h4 className="text-sm font-bold text-white">{inv.name}</h4>
                      </div>
                      {inv.notes && <p className="text-xs text-slate-400 mt-1">{inv.notes}</p>}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-black text-white">{formatINR(inv.amount)}</p>
                        {inv.monthly_contribution > 0 && (
                          <p className="text-[11px] text-emerald-400 font-semibold">
                            SIP: {formatINR(inv.monthly_contribution)}/mo
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
