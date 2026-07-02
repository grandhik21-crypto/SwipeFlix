import express from 'express';
import db from '../db.js';
import * as tmdbService from '../services/tmdbService.js';

const router = express.Router();

/**
 * Get all genres and cache them
 */
const getGenreMap = async () => {
  try {
    const genres = await tmdbService.getGenres();
    const genreMap = {};
    genres.forEach(g => {
      genreMap[g.id] = g.name;
    });
    return genreMap;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return {};
  }
};

/**
 * Extract unique genre IDs from liked movies
 */
const extractLikedGenres = (likedMovies) => {
  const genreSet = new Set();
  
  likedMovies.forEach(movie => {
    try {
      const genres = JSON.parse(movie.genre_ids || '[]');
      genres.forEach(g => genreSet.add(g));
    } catch (e) {
      console.error('Error parsing genres:', e);
    }
  });

  return Array.from(genreSet);
};

/**
 * Get all swiped movie IDs (to exclude from recommendations)
 */
const getSwipedMovieIds = async (userId) => {
  const swipes = await db.all(
    'SELECT movie_id FROM swipes WHERE user_id = ?',
    [userId]
  );
  return swipes.map(s => s.movie_id);
};

/**
 * POST /api/recommendations/generate
 * Trigger recommendation generation (optional admin endpoint)
 */
router.post('/generate', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Generate recommendations
    const recommendations = await generateRecommendations(userId);

    res.json({
      userId,
      recommendationsGenerated: recommendations.length,
      recommendations: recommendations.slice(0, 20),
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/recommendations/:userId
 * Get personalized recommendations for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const recommendations = await generateRecommendations(userId, parseInt(limit));

    res.json({
      userId,
      count: recommendations.length,
      limit: parseInt(limit),
      recommendations,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Core recommendation engine logic
 * 1. Find all liked movies
 * 2. Extract genres from those movies
 * 3. Fetch new movies from TMDB by those genres
 * 4. Remove already swiped movies
 * 5. Return top recommendations
 */
export const generateRecommendations = async (userId, limit = 20) => {
  try {
    console.log(`\n🎬 Generating recommendations for user ${userId}...`);

    // Step 1: Get user's liked movies
    const likedMovies = await db.all(
      `SELECT * FROM swipes 
       WHERE user_id = ? AND action = 'like'`,
      [userId]
    );

    console.log(`✓ Found ${likedMovies.length} liked movies`);

    // If no liked movies, return trending movies as fallback
    if (likedMovies.length === 0) {
      console.log('ℹ️  No liked movies found, returning trending movies...');
      const trending = await tmdbService.getTrendingMovies();
      const swipedIds = await getSwipedMovieIds(userId);
      return trending
        .filter(m => !swipedIds.includes(m.id))
        .slice(0, limit);
    }

    // Step 2: Extract genres from liked movies
    // We need to fetch full movie details to get genre info
    const likedMovieDetails = [];
    for (const like of likedMovies.slice(0, 5)) { // Sample first 5 liked movies
      try {
        const details = await tmdbService.getMovieDetails(like.movie_id);
        if (details.genres) {
          likedMovieDetails.push(details);
        }
      } catch (e) {
        console.warn(`Could not fetch details for movie ${like.movie_id}`);
      }
    }

    // Extract genres
    const genreSet = new Set();
    likedMovieDetails.forEach(movie => {
      if (Array.isArray(movie.genres)) {
        movie.genres.forEach(g => {
          if (typeof g === 'object' && g.id) {
            genreSet.add(g.id);
          }
        });
      }
    });

    const likedGenres = Array.from(genreSet);
    console.log(`✓ Extracted ${likedGenres.length} genres from liked movies:`, likedGenres);

    // Step 3: Fetch movies from TMDB by genres
    let recommendations = [];
    
    if (likedGenres.length > 0) {
      // Fetch movies for each genre
      for (const genreId of likedGenres.slice(0, 3)) { // Top 3 genres
        try {
          const result = await tmdbService.getMoviesByGenre(genreId, 1);
          recommendations.push(...result.movies);
        } catch (e) {
          console.warn(`Could not fetch movies for genre ${genreId}`);
        }
      }
      console.log(`✓ Fetched ${recommendations.length} movies from genres`);
    }

    // Fallback to trending if no genre-based results
    if (recommendations.length === 0) {
      console.log('ℹ️  No genre-based results, falling back to trending...');
      recommendations = await tmdbService.getTrendingMovies();
    }

    // Step 4: Remove already swiped movies
    const swipedIds = await getSwipedMovieIds(userId);
    console.log(`✓ User has swiped on ${swipedIds.length} movies`);

    const filtered = recommendations.filter(m => !swipedIds.includes(m.id));
    console.log(`✓ After filtering: ${filtered.length} new recommendations`);

    // Step 5: Remove duplicates and sort by rating
    const uniqueMovies = Array.from(
      new Map(filtered.map(m => [m.id, m])).values()
    ).sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const finalRecommendations = uniqueMovies.slice(0, limit);
    console.log(`✓ Final recommendations: ${finalRecommendations.length} movies\n`);

    return finalRecommendations;
  } catch (error) {
    console.error('Recommendation engine error:', error);
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
};

/**
 * GET /api/recommendations/:userId/debug
 * Debug endpoint to see recommendation calculation steps
 */
router.get('/:userId/debug', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`\n🔍 DEBUG: Analyzing recommendations for user ${userId}`);

    // Get liked movies
    const likedMovies = await db.all(
      `SELECT * FROM swipes WHERE user_id = ? AND action = 'like'`,
      [userId]
    );

    // Get all swiped movies
    const allSwipes = await db.all(
      `SELECT action, COUNT(*) as count FROM swipes WHERE user_id = ? GROUP BY action`,
      [userId]
    );

    // Get swiped movie IDs
    const swipedIds = await getSwipedMovieIds(userId);

    res.json({
      userId,
      likedMoviesCount: likedMovies.length,
      likedMovies: likedMovies.map(m => m.movie_id),
      totalSwipesCount: swipedIds.length,
      swipeBreakdown: allSwipes,
      allSwipedMovieIds: swipedIds,
      recommendationAlgorithm: {
        step1: 'Extract liked movies',
        step2: 'Get genres from liked movies',
        step3: 'Fetch new movies by genres',
        step4: 'Remove already swiped movies',
        step5: 'Return top 20 sorted by rating',
      },
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
