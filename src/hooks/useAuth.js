import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manages Supabase auth session.
 * Returns: { session, user, loading, signIn, signUp, signOut }
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    // onAuthStateChange fires immediately on mount with the current session (INITIAL_SESSION event)
    // This avoids a race condition where getSession() could overwrite a fresh session
    // set by a concurrent onAuthStateChange event (e.g. right after signup)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async (email, password, profileData) => {
    // 1. Create the auth user
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // 2. Insert the profile row
    const userId = data.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        ...profileData,
        issued: new Date().toISOString().split('T')[0],
        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      if (profileError) {
        console.error('Profile insert error:', profileError);
        // Don't throw — auth succeeded, profile can be retried
      }
    }

    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { session, user: session?.user ?? null, loading, signIn, signUp, signOut };
}
