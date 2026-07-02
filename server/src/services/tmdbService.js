import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

if (!TMDB_API_KEY) {
  console.warn('⚠️  TMDB_API_KEY not set in .env');
}

/**
 * Create axios instance with TMDB API configuration
 */
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

/**
 * Cache utility functions
 */
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✓ Cache hit for: ${key}`);
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Simplify movie data to return consistent format
 */
const simplifyMovieData = (movie) => {
  return {
    id: movie.id,
    title: movie.title || movie.name,
    overview: movie.overview || '',
    poster_url: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    backdrop_url: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : null,
    genres: movie.genre_ids || [],
    rating: movie.vote_average || 0,
    release_date: movie.release_date || movie.first_air_date || '',
    popularity: movie.popularity || 0,
    vote_count: movie.vote_count || 0,
  };
};

/**
 * Get genre details
 */
export const getGenres = async () => {
  const cacheKey = 'genres';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await tmdbApi.get('/genre/movie/list');
    const genres = response.data.genres;
    setCachedData(cacheKey, genres);
    return genres;
  } catch (error) {
    console.error('Error fetching genres:', error.message);
    throw new Error(`Failed to fetch genres: ${error.message}`);
  }
};

/**
 * Get trending movies for the week
 * @returns {Array} Array of simplified movie objects
 */
export const getTrendingMovies = async () => {
  const cacheKey = 'trending_movies_week';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await tmdbApi.get('/trending/movie/week');
    const simplified = response.data.results.map(simplifyMovieData);
    setCachedData(cacheKey, simplified);
    console.log(`✓ Fetched ${simplified.length} trending movies`);
    return simplified;
  } catch (error) {
    console.error('Error fetching trending movies:', error.message);
    throw new Error(`Failed to fetch trending movies: ${error.message}`);
  }
};

/**
 * Get movie details by ID
 * @param {number} movieId - TMDB movie ID
 * @returns {Object} Simplified movie object with full details
 */
export const getMovieDetails = async (movieId) => {
  if (!movieId) {
    throw new Error('Movie ID is required');
  }

  const cacheKey = `movie_details_${movieId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits,videos',
      },
    });

    const movie = response.data;
    const simplified = {
      ...simplifyMovieData(movie),
      budget: movie.budget || 0,
      revenue: movie.revenue || 0,
      runtime: movie.runtime || 0,
      status: movie.status || '',
      tagline: movie.tagline || '',
      genres: movie.genres || [],
      production_companies: movie.production_companies || [],
      cast: (movie.credits?.cast || []).slice(0, 10).map(actor => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path
          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
          : null,
      })),
      director: (movie.credits?.crew || [])
        .find(crew => crew.job === 'Director')
        ?.name || null,
      videos: (movie.videos?.results || []).filter(v => v.type === 'Trailer').slice(0, 3),
    };

    setCachedData(cacheKey, simplified);
    console.log(`✓ Fetched details for movie ID: ${movieId}`);
    return simplified;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error.message);
    throw new Error(`Failed to fetch movie details: ${error.message}`);
  }
};

/**
 * Get movies by genre
 * @param {number|string} genreId - TMDB genre ID
 * @param {number} page - Page number (default: 1)
 * @returns {Object} { movies: Array, totalPages: number }
 */
export const getMoviesByGenre = async (genreId, page = 1) => {
  if (!genreId) {
    throw new Error('Genre ID is required');
  }

  const cacheKey = `movies_genre_${genreId}_page_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
      },
    });

    const result = {
      movies: response.data.results.map(simplifyMovieData),
      totalPages: response.data.total_pages,
      currentPage: response.data.page,
      totalResults: response.data.total_results,
    };

    setCachedData(cacheKey, result);
    console.log(`✓ Fetched ${result.movies.length} movies for genre ${genreId} (page ${page})`);
    return result;
  } catch (error) {
    console.error(`Error fetching movies for genre ${genreId}:`, error.message);
    throw new Error(`Failed to fetch movies by genre: ${error.message}`);
  }
};

/**
 * Discover movies with multiple filters
 * @param {number} page - Page number (default: 1)
 * @param {Object} filters - Optional filters { genreId, sortBy, minRating, releaseYear }
 * @returns {Object} { movies: Array, totalPages: number }
 */
export const discoverMovies = async (page = 1, filters = {}) => {
  const {
    genreId = null,
    sortBy = 'popularity.desc',
    minRating = 5,
    releaseYear = null,
    language = 'en',
  } = filters;

  const cacheKey = `discover_movies_${JSON.stringify({ page, ...filters })}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const params = {
      page,
      sort_by: sortBy,
      'vote_average.gte': minRating,
      with_original_language: language,
    };

    if (genreId) {
      params.with_genres = genreId;
    }

    if (releaseYear) {
      params.primary_release_year = releaseYear;
    }

    const response = await tmdbApi.get('/discover/movie', { params });

    const result = {
      movies: response.data.results.map(simplifyMovieData),
      totalPages: response.data.total_pages,
      currentPage: response.data.page,
      totalResults: response.data.total_results,
      appliedFilters: filters,
    };

    setCachedData(cacheKey, result);
    console.log(`✓ Discovered ${result.movies.length} movies (page ${page})`);
    return result;
  } catch (error) {
    console.error('Error discovering movies:', error.message);
    throw new Error(`Failed to discover movies: ${error.message}`);
  }
};

/**
 * Search movies by title
 * @param {string} query - Search query
 * @param {number} page - Page number (default: 1)
 * @returns {Object} { movies: Array, totalPages: number }
 */
export const searchMovies = async (query, page = 1) => {
  if (!query || query.trim() === '') {
    throw new Error('Search query is required');
  }

  const cacheKey = `search_movies_${query}_page_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query,
        page,
      },
    });

    const result = {
      movies: response.data.results.map(simplifyMovieData),
      totalPages: response.data.total_pages,
      currentPage: response.data.page,
      totalResults: response.data.total_results,
      query,
    };

    setCachedData(cacheKey, result);
    console.log(`✓ Found ${result.movies.length} movies matching "${query}"`);
    return result;
  } catch (error) {
    console.error(`Error searching movies for "${query}":`, error.message);
    throw new Error(`Failed to search movies: ${error.message}`);
  }
};

/**
 * Get popular movies
 * @param {number} page - Page number (default: 1)
 * @returns {Object} { movies: Array, totalPages: number }
 */
export const getPopularMovies = async (page = 1) => {
  const cacheKey = `popular_movies_page_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await tmdbApi.get('/movie/popular', {
      params: { page },
    });

    const result = {
      movies: response.data.results.map(simplifyMovieData),
      totalPages: response.data.total_pages,
      currentPage: response.data.page,
      totalResults: response.data.total_results,
    };

    setCachedData(cacheKey, result);
    console.log(`✓ Fetched ${result.movies.length} popular movies (page ${page})`);
    return result;
  } catch (error) {
    console.error('Error fetching popular movies:', error.message);
    throw new Error(`Failed to fetch popular movies: ${error.message}`);
  }
};

/**
 * Get top-rated movies
 * @param {number} page - Page number (default: 1)
 * @returns {Object} { movies: Array, totalPages: number }
 */
export const getTopRatedMovies = async (page = 1) => {
  const cacheKey = `top_rated_movies_page_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await tmdbApi.get('/movie/top_rated', {
      params: { page },
    });

    const result = {
      movies: response.data.results.map(simplifyMovieData),
      totalPages: response.data.total_pages,
      currentPage: response.data.page,
      totalResults: response.data.total_results,
    };

    setCachedData(cacheKey, result);
    console.log(`✓ Fetched ${result.movies.length} top-rated movies (page ${page})`);
    return result;
  } catch (error) {
    console.error('Error fetching top-rated movies:', error.message);
    throw new Error(`Failed to fetch top-rated movies: ${error.message}`);
  }
};

/**
 * Get upcoming movies
 * @param {number} page - Page number (default: 1)
 * @returns {Object} { movies: Array, totalPages: number }
 */
export const getUpcomingMovies = async (page = 1) => {
  const cacheKey = `upcoming_movies_page_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await tmdbApi.get('/movie/upcoming', {
      params: { page },
    });

    const result = {
      movies: response.data.results.map(simplifyMovieData),
      totalPages: response.data.total_pages,
      currentPage: response.data.page,
      totalResults: response.data.total_results,
    };

    setCachedData(cacheKey, result);
    console.log(`✓ Fetched ${result.movies.length} upcoming movies (page ${page})`);
    return result;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error.message);
    throw new Error(`Failed to fetch upcoming movies: ${error.message}`);
  }
};

/**
 * Clear cache (useful for testing or forcing refresh)
 */
export const clearCache = () => {
  cache.clear();
  console.log('✓ Cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    size: cache.size,
    items: Array.from(cache.keys()),
  };
};

export default {
  getTrendingMovies,
  getMovieDetails,
  getMoviesByGenre,
  discoverMovies,
  searchMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getGenres,
  clearCache,
  getCacheStats,
};
