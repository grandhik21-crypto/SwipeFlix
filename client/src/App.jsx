import { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './components/Navigation';
import MovieCard from './components/MovieCard';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('swipe');
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-login with demo user
  useEffect(() => {
    loginUser('demo_user');
  }, []);

  // Fetch recommendations when user changes
  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const loginUser = async (username) => {
    try {
      const response = await axios.post('/api/auth/login', { username });
      setUser(response.data.user);
      setError(null);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Failed to login. Is the backend running on http://localhost:5000?');
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/recommendations/${user.id}?limit=20`);
      setMovies(response.data.recommendations || []);
      setCurrentMovieIndex(0);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setError('Failed to fetch movies. Check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (!user || movies.length === 0 || currentMovieIndex >= movies.length) return;

    const movie = movies[currentMovieIndex];

    try {
      // Send swipe to backend
      await axios.post('/api/swipes', {
        userId: user.id,
        movieId: movie.id,
        action,
        movieData: {
          title: movie.title,
          poster_path: movie.poster_url,
          overview: movie.overview,
          genre_ids: movie.genres,
          vote_average: movie.rating,
          release_date: movie.release_date,
        },
      });

      // Move to next movie
      setCurrentMovieIndex(currentMovieIndex + 1);

      // Fetch more movies if running low
      if (currentMovieIndex >= movies.length - 3) {
        fetchRecommendations();
      }

      setError(null);
    } catch (error) {
      console.error('Failed to record swipe:', error);
      setError('Failed to save your swipe. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 text-red-100 p-4 text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content */}
      <main>
        {currentPage === 'swipe' && (
          <div className="flex flex-col items-center justify-center">
            {loading ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin text-6xl mb-4">🎬</div>
                  <p className="text-white text-xl">Loading movies...</p>
                </div>
              </div>
            ) : movies.length > 0 && currentMovieIndex < movies.length ? (
              <MovieCard
                movie={movies[currentMovieIndex]}
                onSwipe={handleSwipe}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white text-3xl mb-4">🎉</p>
                  <p className="text-white text-2xl mb-4">No more movies to swipe!</p>
                  <button
                    onClick={fetchRecommendations}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
                  >
                    Get More Recommendations
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'profile' && user && (
          <Profile userId={user.id} />
        )}
      </main>
    </div>
  );
}

export default App;
