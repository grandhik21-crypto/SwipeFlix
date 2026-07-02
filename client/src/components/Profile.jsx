import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({ userId }) => {
  const [swipes, setSwipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ likes: 0, dislikes: 0, watched: 0, total: 0 });
  const [filter, setFilter] = useState('all'); // all, like, dislike, watched

  useEffect(() => {
    fetchSwipes();
    fetchStats();
  }, [userId]);

  const fetchSwipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/swipes/${userId}`);
      setSwipes(response.data.swipes || []);
    } catch (error) {
      console.error('Failed to fetch swipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/swipes/${userId}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filteredSwipes = swipes.filter(
    (swipe) => filter === 'all' || swipe.action === filter
  );

  const getActionColor = (action) => {
    switch (action) {
      case 'like':
        return 'text-green-500';
      case 'dislike':
        return 'text-red-500';
      case 'watched':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'like':
        return '❤️ Liked';
      case 'dislike':
        return '✕ Disliked';
      case 'watched':
        return '👁️ Watched';
      default:
        return action;
    }
  };

  const getActionBgColor = (action) => {
    switch (action) {
      case 'like':
        return 'bg-green-900 text-green-300';
      case 'dislike':
        return 'bg-red-900 text-red-300';
      case 'watched':
        return 'bg-purple-900 text-purple-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'like', 'dislike', 'watched'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {f === 'all'
                ? 'All'
                : f === 'like'
                ? '❤️ Liked'
                : f === 'dislike'
                ? '✕ Disliked'
                : '👁️ Watched'}
            </button>
          ))}
        </div>

        {/* Swipes List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-400">Loading swipes...</p>
          ) : filteredSwipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-2">No swipes yet</p>
              <p className="text-gray-500">Go to Discover to start swiping!</p>
            </div>
          ) : (
            filteredSwipes.map((swipe, idx) => (
              <div
                key={idx}
                className="bg-gray-800 bg-opacity-70 p-4 rounded-lg hover:bg-opacity-100 transition-all flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-bold ${getActionColor(swipe.action)}`}>
                      {swipe.action === 'like'
                        ? '❤️'
                        : swipe.action === 'dislike'
                        ? '✕'
                        : '👁️'}
                    </span>
                    <div>
                      <p className="text-gray-300">Movie ID: {swipe.movie_id}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(swipe.created_at).toLocaleDateString()} at{' '}
                        {new Date(swipe.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold ${getActionBgColor(swipe.action)}`}>
                  {getActionBadge(swipe.action)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
