import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Fetches doctors from Supabase with specialty and search filters.
 * Returns: { doctors, loading, fetchDoctors }
 */
export function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDoctors = useCallback(async ({ specialty = 'All', search = '' } = {}) => {
    setLoading(true);
    let query = supabase.from('doctors').select('*');

    if (specialty && specialty !== 'All') {
      query = query.eq('specialty', specialty);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,specialty.ilike.%${search}%,location.ilike.%${search}%`);
    }

    const { data, error } = await query.order('name', { ascending: true });
    
    if (!error) {
      setDoctors(data || []);
    } else {
      console.error('Error fetching doctors:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return { doctors, loading, fetchDoctors };
}
