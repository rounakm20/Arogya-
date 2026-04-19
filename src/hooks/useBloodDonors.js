import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Fetches blood donors from Supabase with blood group + city filters.
 * Returns: { donors, loading, fetchDonors, registerAsDonor, sendRequest }
 */
export function useBloodDonors() {
  const [donors, setDonors]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDonors = useCallback(async ({ blood = 'All', search = '' } = {}) => {
    setLoading(true);
    let query = supabase.from('blood_donors').select('*').eq('available', true);

    if (blood && blood !== 'All') query = query.eq('blood', blood);
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,city.ilike.%${search}%`
      );
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error) setDonors(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDonors(); }, [fetchDonors]);

  /**
   * Register the current user as a blood donor.
   */
  const registerAsDonor = useCallback(async ({ name, blood, city, phone, userId }) => {
    const { data, error } = await supabase
      .from('blood_donors')
      .upsert({ name, blood, city, phone, user_id: userId, available: true, last_donated: 'Recently' })
      .select()
      .single();
    if (error) throw error;
    setDonors(prev => [data, ...prev]);
    return data;
  }, []);

  /**
   * Log an urgent blood request (creates a broadcast_requests record).
   */
  const sendRequest = useCallback(async (form) => {
    const { error } = await supabase.from('blood_requests').insert(form);
    if (error) throw error;
  }, []);

  return { donors, loading, fetchDonors, registerAsDonor, sendRequest };
}
