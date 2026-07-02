import express from 'express';
import db from '../db.js';
import { getPopularMovies, getTrendingMovies } from '../services/tmdbService.js';

const router = express.Router();

// Get recommendations for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's liked genres
    const likedMovies = await db.all(
      `SELECT DISTINCT m.genre_ids FROM swipes s
       JOIN movies m ON s.movie_id = m.id
       WHERE s.user_id = ? AND s.action = 'like'`,
      [userId]
    );

    // Get disliked movie IDs
    const dislikedMovies = await db.all(
      'SELECT movie_id FROM swipes WHERE user_id = ? AND action = "dislike"',
      [userId]
    );
    const dislikedIds = dislikedMovies.map(m => m.movie_id);

    // Fetch trending movies as recommendations
    const recommendations = await getTrendingMovies();

    // Filter out already swiped and disliked
    const swipedMovies = await db.all(
      'SELECT movie_id FROM swipes WHERE user_id = ?',
      [userId]
    );
    const swipedIds = swipedMovies.map(m => m.movie_id);

    const filtered = recommendations
      .filter(m => !swipedIds.includes(m.id) && !dislikedIds.includes(m.id))
      .slice(0, 20);

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
