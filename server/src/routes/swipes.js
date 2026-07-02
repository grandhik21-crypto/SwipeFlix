import express from 'express';
import db from '../db.js';

const router = express.Router();

// Record a swipe
router.post('/', async (req, res) => {
  try {
    const { userId, movieId, action } = req.body;

    if (!['like', 'dislike', 'watched'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const result = await db.run(
      'INSERT OR REPLACE INTO swipes (user_id, movie_id, action) VALUES (?, ?, ?)',
      [userId, movieId, action]
    );

    res.json({ success: true, swipeId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's swipes
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const swipes = await db.all(
      'SELECT * FROM swipes WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(swipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
