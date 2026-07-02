import express from 'express';
import db from '../db.js';
import * as tmdbService from '../services/tmdbService.js';

const router = express.Router();

/**
 * POST /api/swipes
 * Record a user's swipe (like, dislike, watched)
 */
router.post('/', async (req, res) => {
  try {
    const { userId, movieId, action, movieData } = req.body;

    // Validate input
    if (!userId || !movieId || !action) {
      return res.status(400).json({ 
        error: 'userId, movieId, and action are required' 
      });
    }

    if (!['like', 'dislike', 'watched'].includes(action)) {
      return res.status(400).json({ 
        error: 'Invalid action. Must be: like, dislike, or watched' 
      });
    }

    // Store movie data in cache (optional - helps with future recommendations)
    if (movieData) {
      await db.run(
        `INSERT OR IGNORE INTO movies (id, title, poster_path, overview, genre_ids, popularity, rating, release_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          movieId,
          movieData.title || '',
          movieData.poster_path || '',
          movieData.overview || '',
          JSON.stringify(movieData.genre_ids || []),
          movieData.popularity || 0,
          movieData.vote_average || 0,
          movieData.release_date || '',
        ]
      );
    }

    // Record the swipe
    const result = await db.run(
      `INSERT OR REPLACE INTO swipes (user_id, movie_id, action, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [userId, movieId, action]
    );

    res.json({ 
      success: true, 
      swipeId: result.id,
      message: `Movie ${movieId} marked as ${action}`
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/swipes/:userId
 * Get all swipes for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const swipes = await db.all(
      `SELECT * FROM swipes 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      userId,
      totalSwipes: swipes.length,
      swipes,
    });
  } catch (error) {
    console.error('Get swipes error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/swipes/:userId/stats
 * Get swipe statistics for a user
 */
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await db.all(
      `SELECT action, COUNT(*) as count 
       FROM swipes 
       WHERE user_id = ? 
       GROUP BY action`,
      [userId]
    );

    const total = await db.get(
      `SELECT COUNT(*) as total FROM swipes WHERE user_id = ?`,
      [userId]
    );

    const statsByAction = {};
    stats.forEach(stat => {
      statsByAction[stat.action] = stat.count;
    });

    res.json({
      userId,
      total: total.total,
      likes: statsByAction.like || 0,
      dislikes: statsByAction.dislike || 0,
      watched: statsByAction.watched || 0,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
