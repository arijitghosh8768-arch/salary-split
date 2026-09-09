import db from '../db/index.js';
import { calculateSalaryAllocation, DEFAULT_RULE } from '../utils/calculationEngine.js';

export async function getMonthlyHistory(req, res) {
  const userId = req.user.id;
  try {
    const salaryRecords = await db.all('SELECT * FROM salary_records WHERE user_id = ? ORDER BY month ASC', [userId]);
    let rule = await db.get('SELECT * FROM budget_rules WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
    if (!rule) rule = DEFAULT_RULE;

    const history = await Promise.all(salaryRecords.map(async (rec) => {
      const calc = calculateSalaryAllocation(rec.salary, rule);

      const spentRow = await db.get(
        'SELECT SUM(amount) as total_spent FROM expenses WHERE user_id = ? AND expense_date LIKE ?',
        [userId, `${rec.month}%`]
      );

      const spent = spentRow ? (spentRow.total_spent || 0) : 0;

      return {
        id: rec.id,
        month: rec.month,
        salary: rec.salary,
        home: calc.allocations.home.amount,
        investment: calc.allocations.investment.amount,
        emergency: calc.allocations.emergency.amount,
        travel: calc.allocations.travel.amount,
        personal: calc.allocations.personal.amount,
        total_spent: spent,
        savings_potential: rec.salary - spent
      };
    }));

    return res.json({ history });
  } catch (error) {
    console.error('Error fetching monthly history:', error);
    return res.status(500).json({ error: 'Failed to fetch monthly financial history.' });
  }
}

export async function getAuditLogs(req, res) {
  const userId = req.user.id;
  try {
    const logs = await db.all('SELECT * FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50', [userId]);
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
}
