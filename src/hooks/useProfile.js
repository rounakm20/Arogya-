import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Fetches and manages the current user's profile from the `profiles` table.
 * Returns: { profile, loading, error, updateProfile, refetch }
 */
export function useProfile(userId) {
  const [profile, setProfile]  = useState(null);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) { setProfile(null); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Row not found — auto-create an empty profile row so the UI works
        const blankProfile = { id: userId, name: '', created_at: new Date().toISOString() };
        await supabase.from('profiles').insert([blankProfile]);
        setProfile(blankProfile);
      } else {
        setError(error.message);
      }
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = useCallback(async (updates) => {
    if (!userId) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
    setProfile(prev => ({ ...prev, ...updates }));
  }, [userId]);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
