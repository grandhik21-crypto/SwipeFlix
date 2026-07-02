import { useState, useCallback } from 'react';
import axios from 'axios';

export const useSwipe = (userId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recordSwipe = useCallback(
    async (movieId, action) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post('/api/swipes', {
          userId,
          movieId,
          action,
        });
        return response.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  return { recordSwipe, loading, error };
};
