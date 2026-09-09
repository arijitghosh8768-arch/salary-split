import db from '../db/index.js';
import { calculateSalaryAllocation, validateRulePercentages, DEFAULT_RULE } from '../utils/calculationEngine.js';

export async function getSalaryAndRule(req, res) {
  const userId = req.user.id;
  try {
    let rule = await db.get('SELECT * FROM budget_rules WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
    if (!rule) {
      rule = { ...DEFAULT_RULE };
    }

    const latestRecord = await db.get('SELECT * FROM salary_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
    const salary = latestRecord ? latestRecord.salary : 0;
    const month = latestRecord ? latestRecord.month : new Date().toISOString().substring(0, 7);

    const calculation = calculateSalaryAllocation(salary, rule);

    return res.json({
      month,
      salary,
      rule,
      calculation,
      latestRecord
    });
  } catch (error) {
    console.error('Error fetching salary & rule:', error);
    return res.status(500).json({ error: 'Failed to retrieve salary data.' });
  }
}

export async function saveSalaryRecord(req, res) {
  const userId = req.user.id;
  const { salary, month } = req.body;

  if (salary === undefined || isNaN(salary) || salary < 0) {
    return res.status(400).json({ error: 'Valid positive salary amount is required.' });
  }

  const recordMonth = month || new Date().toISOString().substring(0, 7);

  try {
    const existing = await db.get('SELECT id FROM salary_records WHERE user_id = ? AND month = ?', [userId, recordMonth]);
    if (existing) {
      await db.run('UPDATE salary_records SET salary = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?', [salary, existing.id]);
    } else {
      await db.run('INSERT INTO salary_records (user_id, month, salary) VALUES (?, ?, ?)', [userId, recordMonth, salary]);
    }

    let rule = await db.get('SELECT * FROM budget_rules WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
    if (!rule) rule = DEFAULT_RULE;

    const calculation = calculateSalaryAllocation(salary, rule);
    return res.json({
      message: 'Salary saved successfully',
      month: recordMonth,
      salary,
      calculation
    });
  } catch (error) {
    console.error('Error saving salary record:', error);
    return res.status(500).json({ error: 'Failed to save salary record.' });
  }
}

export async function updateBudgetRule(req, res) {
  const userId = req.user.id;
  const { home_pct, invest_pct, emergency_pct, travel_pct, personal_pct } = req.body;

  const rule = {
    home_pct: Number(home_pct),
    invest_pct: Number(invest_pct),
    emergency_pct: Number(emergency_pct),
    travel_pct: Number(travel_pct),
    personal_pct: Number(personal_pct)
  };

  if (!validateRulePercentages(rule)) {
    const total = rule.home_pct + rule.invest_pct + rule.emergency_pct + rule.travel_pct + rule.personal_pct;
    return res.status(400).json({
      error: `Rule percentages must add up to exactly 100%. Current total: ${total}%`
    });
  }

  try {
    const existing = await db.get('SELECT id FROM budget_rules WHERE user_id = ?', [userId]);
    if (existing) {
      await db.run(
        `UPDATE budget_rules
         SET home_pct = ?, invest_pct = ?, emergency_pct = ?, travel_pct = ?, personal_pct = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [rule.home_pct, rule.invest_pct, rule.emergency_pct, rule.travel_pct, rule.personal_pct, userId]
      );
    } else {
      await db.run(
        `INSERT INTO budget_rules (user_id, home_pct, invest_pct, emergency_pct, travel_pct, personal_pct)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, rule.home_pct, rule.invest_pct, rule.emergency_pct, rule.travel_pct, rule.personal_pct]
      );
    }

    return res.json({
      message: 'Custom budget rule updated successfully',
      rule
    });
  } catch (error) {
    console.error('Error updating budget rule:', error);
    return res.status(500).json({ error: 'Failed to update custom budget rule.' });
  }
}
