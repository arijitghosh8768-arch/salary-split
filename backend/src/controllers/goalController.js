import db from '../db/index.js';
import { calculateGoalTimeline } from '../utils/calculationEngine.js';

export async function getGoals(req, res) {
  const userId = req.user.id;

  try {
    const goals = await db.all('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    const enrichedGoals = goals.map(goal => {
      const timeline = calculateGoalTimeline(goal.target_amount, goal.current_amount, goal.monthly_contribution);
      return {
        ...goal,
        timeline
      };
    });

    return res.json({ goals: enrichedGoals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return res.status(500).json({ error: 'Failed to fetch financial goals.' });
  }
}

export async function createGoal(req, res) {
  const userId = req.user.id;
  const { name, category, target_amount, current_amount, monthly_contribution, deadline } = req.body;

  if (!name || !target_amount || target_amount <= 0 || !monthly_contribution || monthly_contribution <= 0) {
    return res.status(400).json({ error: 'Goal name, positive target amount, and positive monthly contribution are required.' });
  }

  const initialCurrent = current_amount || 0;
  const goalCategory = category || 'travel';

  try {
    const result = await db.run(
      `INSERT INTO goals (user_id, category, name, target_amount, current_amount, monthly_contribution, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, goalCategory, name, target_amount, initialCurrent, monthly_contribution, deadline || null]
    );

    const timeline = calculateGoalTimeline(target_amount, initialCurrent, monthly_contribution);

    return res.status(201).json({
      message: 'Goal created successfully',
      goal: {
        id: result.lastID,
        user_id: userId,
        category: goalCategory,
        name,
        target_amount,
        current_amount: initialCurrent,
        monthly_contribution,
        deadline,
        timeline
      }
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return res.status(500).json({ error: 'Failed to create financial goal.' });
  }
}

export async function updateGoalProgress(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { current_amount, add_amount } = req.body;

  try {
    const goal = await db.get('SELECT * FROM goals WHERE id = ? AND user_id = ?', [id, userId]);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    let newCurrent = goal.current_amount;
    if (add_amount !== undefined && !isNaN(add_amount)) {
      newCurrent += Number(add_amount);
    } else if (current_amount !== undefined && !isNaN(current_amount)) {
      newCurrent = Number(current_amount);
    }

    newCurrent = Math.max(0, newCurrent);

    await db.run('UPDATE goals SET current_amount = ? WHERE id = ?', [newCurrent, id]);

    const timeline = calculateGoalTimeline(goal.target_amount, newCurrent, goal.monthly_contribution);

    return res.json({
      message: 'Goal updated successfully',
      goal: {
        ...goal,
        current_amount: newCurrent,
        timeline
      }
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return res.status(500).json({ error: 'Failed to update goal progress.' });
  }
}

export async function deleteGoal(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await db.run('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    return res.json({ message: 'Goal deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete goal.' });
  }
}
