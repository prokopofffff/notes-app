const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'notes.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed users if they don't exist
const seedUsers = [
  { username: 'alice', password: 'alice123' },
  { username: 'bob', password: 'bob123' },
];

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)'
);

for (const user of seedUsers) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(user.username);
  if (!existing) {
    const hash = bcrypt.hashSync(user.password, 10);
    insertUser.run(user.username, hash);
  }
}

module.exports = db;
