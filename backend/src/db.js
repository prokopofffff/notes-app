const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'notes.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    body TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

function seedUsers() {
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (count.count > 0) return;

  const seedData = [
    { username: 'alice', password: 'alice123' },
    { username: 'bob', password: 'bob123' },
  ];

  const insert = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');

  for (const user of seedData) {
    const hash = bcrypt.hashSync(user.password, 10);
    insert.run(user.username, hash);
  }

  console.log('Seeded users: alice, bob');
}

seedUsers();

module.exports = db;
