import { useState, useEffect } from 'react';
import axios from 'axios';

function Profile({ userId }) {
  const [swipes, setSwipes] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);

  useEffect(() => {
    fetchUserSwipes();
  }, [userId]);

  const fetchUserSwipes = async () => {
    try {
      const response = await axios.get(`/api/swipes/${userId}`);
      setSwipes(response.data);

      // Extract liked movies
      const liked = response.data.filter(s => s.action === 'like');
      setLikedMovies(liked);
    } catch (error) {
      console.error('Failed to fetch swipes:', error);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Your Profile</h1>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-400">Total Swipes</p>
          <p className="text-3xl font-bold text-white">{swipes.length}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-400">Liked Movies</p>
          <p className="text-3xl font-bold text-green-500">{likedMovies.length}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">❤️ Liked Movies</h2>
      {likedMovies.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {likedMovies.map(swipe => (
            <div key={swipe.id} className="bg-gray-800 p-4 rounded-lg">
              <p className="text-white font-semibold">Movie ID: {swipe.movie_id}</p>
              <p className="text-gray-400 text-sm">
                {new Date(swipe.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No liked movies yet. Start swiping!</p>
      )}
    </div>
  );
}

export default Profile;
