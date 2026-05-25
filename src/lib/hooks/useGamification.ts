import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useGamification() {
  const { profile } = useAuth();
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    
    // In production, fetch from /api/user/profile
    const fetchPoints = async () => {
      // Simulated fetch
      setPoints(150); // Base points for returning user
    };
    fetchPoints();
  }, [profile]);

  return {
    points,
    history,
    awardPoints: (amount: number) => setPoints(p => p + amount)
  };
}
