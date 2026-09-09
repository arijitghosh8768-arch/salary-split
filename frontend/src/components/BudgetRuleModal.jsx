import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function BudgetRuleModal({ isOpen, onClose, currentRule, onRuleUpdated }) {
  const [rule, setRule] = useState({
    home_pct: 35,
    invest_pct: 25,
    emergency_pct: 10,
    travel_pct: 15,
    personal_pct: 15
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentRule) {
      setRule({
        home_pct: currentRule.home_pct ?? 35,
        invest_pct: currentRule.invest_pct ?? 25,
        emergency_pct: currentRule.emergency_pct ?? 10,
        travel_pct: currentRule.travel_pct ?? 15,
        personal_pct: currentRule.personal_pct ?? 15
      });
    }
  }, [currentRule]);

  if (!isOpen) return null;

  const total = Object.values(rule).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const isValid = Math.abs(total - 100) < 0.01;

  const handleChange = (field, val) => {
    setRule(prev => ({ ...prev, [field]: Number(val) }));
    setError('');
    setSuccess('');
  };

  const handleResetDefault = () => {
    setRule({
      home_pct: 35,
      invest_pct: 25,
      emergency_pct: 10,
      travel_pct: 15,
      personal_pct: 15
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setError(`Percentages must sum to exactly 100%. Current total: ${total}%`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.put('/salary/rule', rule);
      setSuccess('Budget allocation rule updated successfully!');
      if (onRuleUpdated) onRuleUpdated(res.data.rule);
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update budget rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Custom Budget Rule Engine 🔥
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Customize your monthly salary division rules. Rules must sum to 100%.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-emerald-400">🏠 Home Expense</span>
                <span className="text-slate-300">{rule.home_pct}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={rule.home_pct}
                onChange={(e) => handleChange('home_pct', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-cyan-400">📈 Investment</span>
                <span className="text-slate-300">{rule.invest_pct}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={rule.invest_pct}
                onChange={(e) => handleChange('invest_pct', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-amber-400">🛟 Emergency Fund</span>
                <span className="text-slate-300">{rule.emergency_pct}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={rule.emergency_pct}
                onChange={(e) => handleChange('emergency_pct', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-indigo-400">🚗 Car / Travel</span>
                <span className="text-slate-300">{rule.travel_pct}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={rule.travel_pct}
                onChange={(e) => handleChange('travel_pct', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-rose-400">🎮 Personal Expense</span>
                <span className="text-slate-300">{rule.personal_pct}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={rule.personal_pct}
                onChange={(e) => handleChange('personal_pct', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className={`p-3 rounded-lg border text-xs flex justify-between items-center ${
            isValid ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <span className="font-semibold">Rule Validation Total:</span>
            <span className="font-bold text-sm">{total}% {isValid ? '✅' : '❌'}</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset (35/25/10/15/15)
            </button>
            <button
              type="submit"
              disabled={!isValid || loading}
              className="flex-1 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-50 transition-all shadow-md shadow-cyan-500/20"
            >
              {loading ? 'Saving Rule...' : 'Save Allocation Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
