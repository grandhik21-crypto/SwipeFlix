import { useState } from 'react';

function SwipeCard({ movie, onSwipe }) {
  const [swiping, setSwiping] = useState(null);

  const handleSwipe = (action) => {
    setSwiping(action);
    setTimeout(() => {
      onSwipe(action);
      setSwiping(null);
    }, 300);
  };

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Image';

  return (
    <div className="w-full max-w-sm">
      <div
        className={`bg-gray-800 rounded-lg shadow-2xl overflow-hidden transform transition-all duration-300 ${
          swiping === 'dislike' ? 'scale-95 opacity-50 rotate-12' : ''
        } ${swiping === 'like' ? 'scale-95 opacity-50 -rotate-12' : ''} ${
          swiping === 'watched' ? 'scale-95 opacity-50' : ''
        }`}
      >
        {/* Movie Poster */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Movie Info */}
        <div className="p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
          <div className="flex items-center gap-4 mb-4 text-sm">
            <span className="text-yellow-400 font-semibold">
              ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
            </span>
            <span className="text-gray-400">
              {movie.release_date?.split('-')[0] || 'N/A'}
            </span>
          </div>
          <p className="text-gray-300 text-sm line-clamp-3 mb-6">
            {movie.overview}
          </p>
        </div>
      </div>

      {/* Swipe Buttons */}
      <div className="flex gap-4 mt-8 justify-center">
        <button
          onClick={() => handleSwipe('dislike')}
          disabled={!!swiping}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition-all disabled:opacity-50"
        >
          ✕ Pass
        </button>
        <button
          onClick={() => handleSwipe('watched')}
          disabled={!!swiping}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition-all disabled:opacity-50"
        >
          👁️ Watched
        </button>
        <button
          onClick={() => handleSwipe('like')}
          disabled={!!swiping}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-all disabled:opacity-50"
        >
          ♥️ Like
        </button>
      </div>
    </div>
  );
}

export default SwipeCard;
