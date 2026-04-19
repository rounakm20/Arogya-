import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manages mood log entries from the `mood_logs` table.
 * Returns: { logs, loading, error, addLog, refetch }
 */
export function useMoodLogs(userId) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      const shaped = (data || []).map(row => ({
        id: row.id,
        day: new Date(row.logged_at).toLocaleDateString('en-IN', { weekday: 'short' }),
        score: row.score,
        mood_name: row.mood_name,
        mood_emoji: row.mood_emoji,
        note: row.note || '',
        logged_at: row.logged_at,
      }));
      setLogs(shaped);
    } catch (err) {
      console.error('Fetch Mood Logs Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addLog = useCallback(async ({ score, note, mood_name, mood_emoji }) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .insert([{
          user_id: userId,
          score,
          note,
          mood_name,
          mood_emoji
        }])
        .select()
        .single();

      if (error) throw error;

      const shaped = {
        id: data.id,
        day: new Date(data.logged_at).toLocaleDateString('en-IN', { weekday: 'short' }),
        score: data.score,
        mood_name: data.mood_name,
        mood_emoji: data.mood_emoji,
        note: data.note || '',
        logged_at: data.logged_at,
      };

      setLogs(prev => [shaped, ...prev.slice(0, 29)]);
      return data;
    } catch (err) {
      console.error('Add Mood Log Error:', err);
      throw err;
    }
  }, [userId]);

  return { logs, loading, error, addLog, refetch: fetchLogs };
}
