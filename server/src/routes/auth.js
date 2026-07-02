import express from 'express';
import { createUser, getUserByUsername } from '../models/User.js';

const router = express.Router();

// Simple login/signup (no password for MVP)
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username required' });
    }

    let user = await getUserByUsername(username);

    if (!user) {
      user = await createUser(username);
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
