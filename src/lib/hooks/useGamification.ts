import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { createClient } from '@/lib/supabase/client';

export function useGamification() {
  const { profile } = useAuth();
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (profile) {
      setPoints(profile.bloom_points || 0);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchPointsAndHistory = async () => {
      // Fetch activity logs directly from Supabase (allowed by Owner RLS)
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setHistory(data);
      }
    };
    
    fetchPointsAndHistory();

    // Subscribe to realtime changes on user_progress to sync points in real-time
    const subscription = supabase
      .channel(`user_progress_sync:${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${profile.id}`
        },
        (payload: any) => {
          if (payload.new && typeof payload.new.bloom_points === 'number') {
            setPoints(payload.new.bloom_points);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id, supabase]);

  const awardPoints = async (amount: number, actionType: string = 'client_action') => {
    if (!profile?.id) return;
    try {
      // Trigger secure points awarding on the backend
      const response = await fetch('/api/user/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          actionType,
          points: amount
        })
      });
      if (response.ok) {
        console.log(`[Gamification] Successfully triggered ${amount} points for ${actionType}`);
      }
    } catch (e) {
      console.error("Failed to award points:", e);
    }
  };

  return {
    points,
    history,
    awardPoints
  };
}
