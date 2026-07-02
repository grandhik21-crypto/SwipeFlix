import React, { useRef } from 'react';
import TinderCard from 'react-tinder-card';

const MovieCard = ({ movie, onSwipe }) => {
  const childRefs = useRef([]);

  const handleSwipe = (direction) => {
    let action;
    switch (direction) {
      case 'right':
        action = 'like';
        break;
      case 'left':
        action = 'dislike';
        break;
      case 'up':
        action = 'watched';
        break;
      default:
        return;
    }

    // Haptic feedback (if available)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    onSwipe(action);
  };

  const swipeLeft = () => {
    childRefs.current[0]?.swipe('left');
  };

  const swipeRight = () => {
    childRefs.current[0]?.swipe('right');
  };

  const swipeUp = () => {
    childRefs.current[0]?.swipe('up');
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black px-4">
      {/* Card Container */}
      <div className="relative w-full max-w-sm h-4/5 mb-8">
        <TinderCard
          ref={(el) => (childRefs.current[0] = el)}
          onSwipe={handleSwipe}
          preventSwipe={['down']}
          className="absolute"
        >
          <div className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden bg-gray-800">
            {/* Poster Image */}
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              {/* Title & Rating */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold leading-tight mb-1">
                    {movie.title}
                  </h2>
                  <p className="text-gray-300 text-sm">
                    {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
                  </p>
                </div>
                <div className="ml-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  ⭐ {movie.rating?.toFixed(1) || 'N/A'}
                </div>
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {movie.genres.slice(0, 3).map((genre, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-600 bg-opacity-70 px-2 py-1 rounded-full"
                    >
                      {typeof genre === 'object' ? genre.name : `Genre ${genre}`}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="text-gray-200 text-sm line-clamp-2">
                {movie.overview || 'No description available'}
              </p>
            </div>

            {/* Swipe Indicators */}
            <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
              <div className="text-5xl opacity-0 text-red-500 font-bold transform -rotate-12">
                NOPE
              </div>
              <div className="text-5xl opacity-0 text-green-500 font-bold transform rotate-12">
                LIKE
              </div>
            </div>
          </div>
        </TinderCard>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center w-full max-w-sm">
        {/* Dislike Button */}
        <button
          onClick={swipeLeft}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg text-2xl"
          title="Dislike (Swipe Left)"
        >
          ✕
        </button>

        {/* Watched Button */}
        <button
          onClick={swipeUp}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg text-2xl"
          title="Watched (Swipe Up)"
        >
          👁️
        </button>

        {/* Like Button */}
        <button
          onClick={swipeRight}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg text-2xl"
          title="Like (Swipe Right)"
        >
          ❤️
        </button>
      </div>

      {/* Swipe Instructions */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-gray-400 text-sm">
        <p>← Dislike • Swipe Up to mark Watched • Like →</p>
      </div>
    </div>
  );
};

export default MovieCard;
