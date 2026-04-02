import bcrypt from 'bcrypt';
import db from './db.js';

const SALT_ROUNDS = 10;

const users = [
  { username: 'alice', password: 'alice123' },
  { username: 'bob', password: 'bob123' },
];

console.log('Seeding database...');

for (const { username, password } of users) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    console.log(`User "${username}" already exists, skipping.`);
    continue;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, password_hash);
  console.log(`Created user: ${username}`);
}

console.log('Seed complete.');
