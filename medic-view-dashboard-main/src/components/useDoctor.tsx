import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const useDoctor = () => {
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchDoctor = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?._id) {
        setDoctor(null);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch doctor data');
      }

      const data = await response.json();
      setDoctor(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching doctor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [user?._id]); // Re-fetch when user ID changes

  return {
    doctor,
    isLoading,
    error,
    refetch: fetchDoctor
  };
};

export default useDoctor;