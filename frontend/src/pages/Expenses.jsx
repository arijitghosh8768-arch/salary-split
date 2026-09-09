import React, { useState, useEffect } from 'react';
import { formatINR, CATEGORY_COLORS } from '../utils/formatters';
import api from '../services/api';
import { Receipt, Plus, Trash2, Tag, Calendar, AlertCircle } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [totalSpent, setTotalSpent] = useState(0);
  const [salaryRuleData, setSalaryRuleData] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [loading, setLoading] = useState(true);

  // New expense form
  const [category, setCategory] = useState('personal');
  const [subcategory, setSubcategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().substring(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      const [expRes, salRes] = await Promise.all([
        api.get(`/expenses?month=${month}`),
        api.get('/salary')
      ]);

      setExpenses(expRes.data.expenses || []);
      setCategoryTotals(expRes.data.categoryTotals || {});
      setTotalSpent(expRes.data.totalSpent || 0);
      setSalaryRuleData(salRes.data);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [month]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/expenses', {
        category,
        subcategory,
        amount: Number(amount),
        description,
        expense_date: expenseDate
      });

      setAmount('');
      setDescription('');
      setSubcategory('');
      fetchExpenseData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenseData();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const calc = salaryRuleData?.calculation?.allocations || {
    home: { amount: 17500 },
    investment: { amount: 12500 },
    emergency: { amount: 5000 },
    travel: { amount: 7500 },
    personal: { amount: 7500 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Receipt className="w-8 h-8 text-cyan-400" />
            Budget vs Actual Expense Tracking
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Log your actual spending across all 5 allocation categories
          </p>
        </div>

        <div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Expense Form & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5 h-fit">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            Log New Expense
          </h3>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="home">🏠 Home Expense</option>
                <option value="investment">📈 Investment</option>
                <option value="emergency">🛟 Emergency Fund</option>
                <option value="travel">🚗 Car / Travel</option>
                <option value="personal">🎮 Personal Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Subcategory (Optional)
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Rent, Grocery, Food, Subscriptions"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Expense Date
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Description / Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly Netflix & Wifi bill"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Recording...' : 'Add Expense Record'}
            </button>
          </form>
        </div>

        {/* Expenses List & Category Progress Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Progress Bars */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-md font-bold text-white">Category Budget vs Actual Spent ({month})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['home', 'investment', 'emergency', 'travel', 'personal'].map(cat => {
                const config = CATEGORY_COLORS[cat];
                const target = calc[cat]?.amount || 0;
                const spent = categoryTotals[cat] || 0;
                const remaining = target - spent;
                const pct = target > 0 ? Math.min(100, Math.round((spent / target) * 100)) : 0;

                return (
                  <div key={cat} className={`p-4 rounded-xl border ${config.border} bg-slate-900/60 space-y-2`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-bold ${config.text}`}>{config.label}</span>
                      <span className="text-slate-400">{pct}% spent</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400">Target: {formatINR(target)}</span>
                      <span className="text-sm font-bold text-white">Spent: {formatINR(spent)}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${pct > 100 ? 'bg-rose-500' : config.text.replace('text-', 'bg-')}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-right font-medium">
                      Remaining:{' '}
                      <span className={remaining >= 0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {formatINR(remaining)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expenses Log Table */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-white">Recent Logged Expenses</h3>
              <span className="text-xs text-slate-400">Total Spent: {formatINR(totalSpent)}</span>
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No expense records logged for {month}. Add your first expense using the form!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Details</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {expenses.map(exp => {
                      const config = CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.personal;
                      return (
                        <tr key={exp.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 text-slate-400 font-mono">{exp.expense_date}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full font-semibold ${config.bg} ${config.text} border ${config.border}`}>
                              {config.label}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-white">{exp.description || exp.subcategory || 'Expense'}</p>
                            {exp.subcategory && <p className="text-[10px] text-slate-400">{exp.subcategory}</p>}
                          </td>
                          <td className="p-3 text-right font-bold text-rose-400">
                            {formatINR(exp.amount)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
