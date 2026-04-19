import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manages health reports with Supabase Storage for file uploads.
 * Returns: { reports, loading, uploadReport, deleteReport }
 */
export function useReports(userId) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('health_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error) setReports(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  /**
   * Upload a file to Supabase Storage and insert a record into health_reports.
   * @param {File} file - The file to upload
   * @param {Object} meta - { name, type, status }
   */
  const uploadReport = useCallback(async (file, meta) => {
    if (!userId || !file) return;

    // 1. Upload to storage
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: storageError } = await supabase.storage
      .from('health_reports')
      .upload(path, file, { contentType: file.type });
    if (storageError) throw storageError;

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from('health_reports')
      .getPublicUrl(path);
    const file_url = urlData?.publicUrl || '';

    // 3. Insert DB record
    const { data, error } = await supabase
      .from('health_reports')
      .insert({
        user_id: userId,
        name: meta.name || file.name,
        type: meta.type || 'Other',
        status: meta.status || 'Pending',
        file_url,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    setReports(prev => [data, ...prev]);
    return data;
  }, [userId]);

  const deleteReport = useCallback(async (id) => {
    const { error } = await supabase.from('health_reports').delete().eq('id', id);
    if (error) throw error;
    setReports(prev => prev.filter(r => r.id !== id));
  }, []);

  return { reports, loading, uploadReport, deleteReport };
}
