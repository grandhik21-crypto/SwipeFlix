import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Navigation = ({ currentPage, setCurrentPage, user }) => {
  const [stats, setStats] = useState({ likes: 0, dislikes: 0, watched: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && currentPage === 'profile') {
      fetchStats();
    }
  }, [currentPage, user]);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/swipes/${user.id}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-900 to-blue-900 text-white py-6 shadow-lg">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">🎬</span>
          <div>
            <h1 className="text-2xl font-bold">SwipeFlix</h1>
            <p className="text-purple-200 text-sm">Rate movies, discover more</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentPage('swipe')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              currentPage === 'swipe'
                ? 'bg-white text-purple-900'
                : 'bg-purple-700 hover:bg-purple-600'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setCurrentPage('profile')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              currentPage === 'profile'
                ? 'bg-white text-purple-900'
                : 'bg-purple-700 hover:bg-purple-600'
            }`}
          >
            Profile
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="text-right">
            <p className="text-sm text-purple-200">Logged in as</p>
            <p className="font-bold">{user.username}</p>
          </div>
        )}
      </div>

      {/* Stats Bar (on profile page) */}
      {currentPage === 'profile' && !loading && (
        <div className="bg-purple-800 bg-opacity-50 mt-4 py-3">
          <div className="max-w-2xl mx-auto px-4 flex justify-around text-center">
            <div>
              <p className="text-purple-200 text-sm">Total Swipes</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-green-300 text-sm">❤️ Likes</p>
              <p className="text-2xl font-bold text-green-400">{stats.likes}</p>
            </div>
            <div>
              <p className="text-red-300 text-sm">✕ Dislikes</p>
              <p className="text-2xl font-bold text-red-400">{stats.dislikes}</p>
            </div>
            <div>
              <p className="text-purple-300 text-sm">👁️ Watched</p>
              <p className="text-2xl font-bold text-purple-300">{stats.watched}</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
