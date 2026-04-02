import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';
import type { LoginRequestBody, User } from '../types';

const router = Router();

router.post('/login', (req: Request<object, object, LoginRequestBody>, res: Response): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { user_id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}` }
  );

  res.json({ token });
});

export default router;
