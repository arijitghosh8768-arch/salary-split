import React, { useState, useEffect } from 'react';
import { formatINR } from '../utils/formatters';
import api from '../services/api';
import { Target, Plus, Trash2, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [salaryRuleData, setSalaryRuleData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New goal form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('travel');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [monthlyContrib, setMonthlyContrib] = useState('7500');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const [goalsRes, salRes] = await Promise.all([
        api.get('/goals'),
        api.get('/salary')
      ]);

      setGoals(goalsRes.data.goals || []);
      setSalaryRuleData(salRes.data);

      const defaultTravelContrib = salRes.data?.calculation?.allocations?.travel?.amount || 7500;
      setMonthlyContrib(String(defaultTravelContrib));
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount || Number(targetAmount) <= 0 || !monthlyContrib || Number(monthlyContrib) <= 0) return;

    setSubmitting(true);
    try {
      await api.post('/goals', {
        name,
        category,
        target_amount: Number(targetAmount),
        current_amount: Number(currentAmount) || 0,
        monthly_contribution: Number(monthlyContrib),
        deadline
      });

      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const handleAddContribution = async (id, amount) => {
    try {
      await api.put(`/goals/${id}`, { add_amount: amount });
      fetchGoals();
    } catch (err) {
      console.error('Failed to update goal progress:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Target className="w-8 h-8 text-indigo-400" />
          Car, Bike & Travel Goal Buckets (15%)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Turn your 15% allocation into structured, goal-driven savings buckets with automated completion timelines
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Goal Form */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5 h-fit">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Create Goal Bucket
          </h3>

          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Goal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. New Bike / Goa Trip / Laptop"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="travel">🚗 Car / Bike / Travel Goal</option>
                <option value="personal">🎮 Tech / Personal Gadget</option>
                <option value="emergency">🛟 Safety / Other Goal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Goal Amount (₹)</label>
              <input
                type="number"
                min="1"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="e.g. 120000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-indigo-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Initial Saved Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Monthly Allocation Contribution (₹)</label>
              <input
                type="number"
                min="1"
                required
                value={monthlyContrib}
                onChange={(e) => setMonthlyContrib(e.target.value)}
                placeholder="e.g. 7500"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-cyan-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Creating...' : 'Create Goal Bucket'}
            </button>
          </form>
        </div>

        {/* Goal Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          {goals.length === 0 ? (
            <div className="glass-card p-10 rounded-2xl border border-slate-800 text-center text-slate-500 text-sm">
              No goal buckets created yet. Create a goal like "New Bike (₹1,20,000)" or "Goa Trip (₹30,000)" to see automated timeframe calculations!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goals.map(goal => {
                const timeline = goal.timeline || {};
                const progress = timeline.progressPercentage || 0;
                const months = timeline.monthsNeeded || 0;

                return (
                  <div key={goal.id} className="glass-card p-6 rounded-2xl border border-indigo-500/20 space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                        {goal.category}
                      </span>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white">{goal.name}</h4>
                      <p className="text-2xl font-black text-indigo-400 mt-1">
                        {formatINR(goal.current_amount)} <span className="text-xs font-normal text-slate-400">/ {formatINR(goal.target_amount)}</span>
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                        <span>{progress}% Goal Reached</span>
                        <span className="text-indigo-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Est: {months} months ({formatINR(goal.monthly_contribution)}/mo)
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleAddContribution(goal.id, goal.monthly_contribution)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-400" />
                        Add {formatINR(goal.monthly_contribution)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
