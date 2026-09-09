import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../salarysplit.db');

const rawDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database connection:', err);
  } else {
    console.log('📦 Connected to SQLite database at:', dbPath);
  }
});

// Enable Foreign Keys
rawDb.run('PRAGMA foreign_keys = ON');

export const db = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  exec: (sql) => {
    return new Promise((resolve, reject) => {
      rawDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

export async function initDatabase() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budget_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      home_pct REAL DEFAULT 35.0,
      invest_pct REAL DEFAULT 25.0,
      emergency_pct REAL DEFAULT 10.0,
      travel_pct REAL DEFAULT 15.0,
      personal_pct REAL DEFAULT 15.0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS salary_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      salary REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      amount REAL NOT NULL,
      description TEXT,
      expense_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'travel',
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      monthly_contribution REAL NOT NULL,
      deadline TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      asset_type TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      monthly_contribution REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      ip_address TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default demo user if not exists
  try {
    const existingDemo = await db.get('SELECT id FROM users WHERE email = ?', ['demo@example.com']);
    if (!existingDemo) {
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.default.genSalt(10);
      const password_hash = await bcrypt.default.hash('password123', salt);
      const res = await db.run(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        ['Demo User', 'demo@example.com', password_hash]
      );
      await db.run(
        `INSERT INTO budget_rules (user_id, home_pct, invest_pct, emergency_pct, travel_pct, personal_pct)
         VALUES (?, 35, 25, 10, 15, 15)`,
        [res.lastID]
      );
      await db.run(
        `INSERT INTO salary_records (user_id, month, salary) VALUES (?, ?, ?)`,
        [res.lastID, new Date().toISOString().substring(0, 7), 50000]
      );
      console.log('✅ Seeded demo account: demo@example.com / password123');
    }
  } catch (err) {
    console.error('Failed to seed demo account:', err);
  }
}

export default db;
