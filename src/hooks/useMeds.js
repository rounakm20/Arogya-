import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const COLORS = ['#dbeafe', '#d1fae5', '#fef3c7', '#ede9fe', '#fce7f3', '#fee2e2'];

/**
 * Full CRUD for the `medications` table.
 * Returns: { meds, loading, addMed, toggleTaken, deleteMed }
 */
export function useMeds(userId) {
  const [meds, setMeds]       = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMeds = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('time', { ascending: true });
    if (!error) setMeds(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchMeds(); }, [fetchMeds]);

  const addMed = useCallback(async (form) => {
    if (!userId) return;
    const color = COLORS[meds.length % COLORS.length];
    const { data, error } = await supabase
      .from('medications')
      .insert({ user_id: userId, ...form, taken_today: false, color })
      .select()
      .single();
    if (error) throw error;
    setMeds(prev => [...prev, data]);
  }, [userId, meds.length]);

  const toggleTaken = useCallback(async (id, currentValue) => {
    const { error } = await supabase
      .from('medications')
      .update({ taken_today: !currentValue })
      .eq('id', id);
    if (error) throw error;
    setMeds(prev => prev.map(m => m.id === id ? { ...m, taken_today: !currentValue } : m));
  }, []);

  const deleteMed = useCallback(async (id) => {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setMeds(prev => prev.filter(m => m.id !== id));
  }, []);

  return { meds, loading, addMed, toggleTaken, deleteMed };
}
