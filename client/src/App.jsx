import { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './components/Navigation';
import SwipeCard from './components/SwipeCard';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('swipe');
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-login with demo user
    loginUser('demo_user');
  }, []);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const loginUser = async (username) => {
    try {
      const response = await axios.post('/api/auth/login', { username });
      setUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/recommendations/${user.id}`);
      setMovies(response.data);
      setCurrentMovieIndex(0);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (!user || movies.length === 0) return;

    const movie = movies[currentMovieIndex];

    try {
      await axios.post('/api/swipes', {
        userId: user.id,
        movieId: movie.id,
        action,
      });

      setCurrentMovieIndex(currentMovieIndex + 1);

      // Fetch more if running low
      if (currentMovieIndex >= movies.length - 3) {
        fetchRecommendations();
      }
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
      />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {currentPage === 'swipe' && (
          <div className="flex flex-col items-center justify-center min-h-screen">
            {loading ? (
              <p className="text-white text-xl">Loading movies...</p>
            ) : movies.length > 0 && currentMovieIndex < movies.length ? (
              <>
                <SwipeCard
                  movie={movies[currentMovieIndex]}
                  onSwipe={handleSwipe}
                />
              </>
            ) : (
              <p className="text-white text-xl">No more movies to swipe!</p>
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
