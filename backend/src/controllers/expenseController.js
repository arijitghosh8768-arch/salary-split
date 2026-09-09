import db from '../db/index.js';

export async function getExpenses(req, res) {
  const userId = req.user.id;
  const { month, category } = req.query;

  try {
    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params = [userId];

    if (month) {
      query += ' AND expense_date LIKE ?';
      params.push(`${month}%`);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY expense_date DESC, id DESC';

    const expenses = await db.all(query, params);

    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return res.json({ expenses, categoryTotals, totalSpent });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
}

export async function addExpense(req, res) {
  const userId = req.user.id;
  const { category, subcategory, amount, description, expense_date } = req.body;

  const validCategories = ['home', 'investment', 'emergency', 'travel', 'personal'];
  if (!category || !validCategories.includes(category.toLowerCase())) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
    });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }

  const date = expense_date || new Date().toISOString().substring(0, 10);

  try {
    const result = await db.run(
      `INSERT INTO expenses (user_id, category, subcategory, amount, description, expense_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, category.toLowerCase(), subcategory || null, amount, description || '', date]
    );

    return res.status(201).json({
      message: 'Expense logged successfully',
      expense: {
        id: result.lastID,
        user_id: userId,
        category: category.toLowerCase(),
        subcategory,
        amount,
        description,
        expense_date: date
      }
    });
  } catch (error) {
    console.error('Error logging expense:', error);
    return res.status(500).json({ error: 'Failed to record expense.' });
  }
}

export async function deleteExpense(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await db.run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Expense record not found or unauthorized.' });
    }
    return res.json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ error: 'Failed to delete expense record.' });
  }
}
