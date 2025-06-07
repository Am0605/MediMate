import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabase';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  profile_completed: boolean;
  onboarding_completed: boolean;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_completed, onboarding_completed')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      setUserProfile(data || { profile_completed: false, onboarding_completed: false });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile({ profile_completed: false, onboarding_completed: false });
    } finally {
      setLoading(false);
    }
  };

  return { 
    user, 
    userProfile, 
    loading,
    isAuthenticated: !!user,
    needsProfileSetup: user && !userProfile?.profile_completed,
    needsOnboarding: user && userProfile?.profile_completed && !userProfile?.onboarding_completed,
    isFullySetup: user && userProfile?.profile_completed && userProfile?.onboarding_completed,
  };
}