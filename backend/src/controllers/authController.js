import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { generateToken } from '../middleware/auth.js';
import { logAudit } from '../middleware/security.js';
import { DEFAULT_RULE } from '../utils/calculationEngine.js';

export async function register(req, res) {
  const { name, email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      await logAudit(null, 'REGISTER_FAILED_DUPLICATE_EMAIL', ip, { email });
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email.toLowerCase(), password_hash]
    );
    const userId = result.lastID;

    // Create default budget rule for new user
    await db.run(
      `INSERT INTO budget_rules (user_id, home_pct, invest_pct, emergency_pct, travel_pct, personal_pct)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, DEFAULT_RULE.home_pct, DEFAULT_RULE.invest_pct, DEFAULT_RULE.emergency_pct, DEFAULT_RULE.travel_pct, DEFAULT_RULE.personal_pct]
    );

    await logAudit(userId, 'REGISTER_SUCCESS', ip);

    const token = generateToken({ id: userId, email: email.toLowerCase(), name });
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email: email.toLowerCase() }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) {
      await logAudit(null, 'LOGIN_FAILED_USER_NOT_FOUND', ip, { email });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await logAudit(user.id, 'LOGIN_FAILED_INVALID_PASSWORD', ip);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await logAudit(user.id, 'LOGIN_SUCCESS', ip);

    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}
