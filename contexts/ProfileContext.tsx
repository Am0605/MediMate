import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/config/supabase';

interface ProfileContextType {
  avatarUrl: string | null;
  userInitials: string;
  refreshProfile: () => Promise<void>;
  updateAvatar: (newAvatarUrl: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState('U');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeProfile();
  }, []);

  const initializeProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setCurrentUserId(user.id);
        await refreshProfile();
        setupRealtimeSubscription(user.id);
      }
    } catch (error) {
      console.error('Error initializing profile:', error);
    }
  };

  const setupRealtimeSubscription = (userId: string) => {
    const channel = supabase
      .channel('global-profile-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('🌍 Global profile update:', payload);
          if (payload.new && 'avatar_url' in payload.new) {
            setAvatarUrl(payload.new.avatar_url);
          }
        }
      )
      .subscribe();
  };

  const refreshProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setAvatarUrl(profile.avatar_url);
        
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        
        let initials = 'U';
        if (firstName && lastName) {
          initials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
        } else if (firstName) {
          initials = firstName.charAt(0).toUpperCase();
        } else if (user.email) {
          initials = user.email.charAt(0).toUpperCase();
        }
        
        setUserInitials(initials);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const updateAvatar = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
  };

  return (
    <ProfileContext.Provider value={{
      avatarUrl,
      userInitials,
      refreshProfile,
      updateAvatar
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}