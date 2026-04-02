import bcrypt from 'bcrypt';
import db from './db';
import { User } from './types';

async function seed(): Promise<void> {
  const email = 'demo@notes.app';
  const password = 'password123';
  const name = 'Demo User';

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as Pick<User, 'id'> | undefined;
  if (existing) {
    console.log('Seed user already exists, skipping.');
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hash, name);
  console.log(`Seed user created: ${email} / ${password}`);
}

seed().catch(console.error);
