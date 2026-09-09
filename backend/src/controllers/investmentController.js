import db from '../db/index.js';

export async function getInvestments(req, res) {
  const userId = req.user.id;
  try {
    const investments = await db.all('SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
    const totalMonthlyContribution = investments.reduce((sum, item) => sum + (item.monthly_contribution || 0), 0);

    const breakdownByAsset = investments.reduce((acc, item) => {
      acc[item.asset_type] = (acc[item.asset_type] || 0) + item.amount;
      return acc;
    }, {});

    return res.json({
      investments,
      totalInvested,
      totalMonthlyContribution,
      breakdownByAsset
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return res.status(500).json({ error: 'Failed to fetch investment records.' });
  }
}

export async function addInvestment(req, res) {
  const userId = req.user.id;
  const { asset_type, name, amount, monthly_contribution, notes } = req.body;

  if (!asset_type || !name || amount === undefined || isNaN(amount) || amount < 0) {
    return res.status(400).json({ error: 'Asset type, asset name, and valid non-negative amount are required.' });
  }

  try {
    const result = await db.run(
      `INSERT INTO investments (user_id, asset_type, name, amount, monthly_contribution, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, asset_type, name, amount, monthly_contribution || 0, notes || '']
    );

    return res.status(201).json({
      message: 'Investment record created',
      investment: {
        id: result.lastID,
        user_id: userId,
        asset_type,
        name,
        amount,
        monthly_contribution: monthly_contribution || 0,
        notes
      }
    });
  } catch (error) {
    console.error('Error adding investment:', error);
    return res.status(500).json({ error: 'Failed to record investment.' });
  }
}

export async function deleteInvestment(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await db.run('DELETE FROM investments WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Investment record not found.' });
    }
    return res.json({ message: 'Investment deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete investment.' });
  }
}
