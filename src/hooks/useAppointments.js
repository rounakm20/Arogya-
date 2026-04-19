import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Handles appointment requests and messages to doctors.
 * Returns: { requests, loading, sendRequest, fetchRequests, cancelRequest }
 */
export function useAppointments(userId) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    // Fetch requests and join with doctors table to get doctor names
    const { data, error } = await supabase
      .from('appointment_requests')
      .select(`
        *,
        doctors (
          name,
          specialty,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) {
      setRequests(data || []);
    } else {
      console.error('Error fetching appointments:', error);
    }
    setLoading(false);
  }, [userId]);

  const sendRequest = useCallback(async ({ userId, doctorId, message }) => {
    const { data, error } = await supabase
      .from('appointment_requests')
      .insert({
        user_id: userId,
        doctor_id: doctorId,
        message: message,
        status: 'Pending'
      })
      .select(`
        *,
        doctors (
          name,
          specialty,
          image_url
        )
      `)
      .single();

    if (error) throw error;
    setRequests(prev => [data, ...prev]);
    return data;
  }, []);

  const cancelRequest = useCallback(async (requestId) => {
    const { error } = await supabase
      .from('appointment_requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
    setRequests(prev => prev.filter(r => r.id !== requestId));
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, sendRequest, fetchRequests, cancelRequest };
}
