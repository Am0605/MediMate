import { useState, useEffect, useCallback } from 'react';
import { UserInfo, HealthNewsItem } from '@/types/home';
import { supabase } from '@/config/supabase';

// Mock health news data
const mockHealthNews: HealthNewsItem[] = [
  {
    id: '1',
    title: 'New Research on Medication Adherence',
    summary: 'Study shows that proper medication tracking can increase medical adherence by up to 40%.',
    image: require('@/assets/images/news1.jpeg'),
    date: 'June 2, 2025',
    category: 'Research'
  },
  {
    id: '2',
    title: 'Health Ministry Updates Vaccination Schedule',
    summary: 'New guidelines released for adult vaccination schedules. Check if you\'re up to date!',
    image: require('@/assets/images/news2.jpg'),
    date: 'June 1, 2025',
    category: 'Guidelines'
  },
  {
    id: '3',
    title: 'Seasonal Allergies: Be Prepared',
    summary: 'Tips to manage your medication during high pollen season.',
    image: require('@/assets/images/news3.jpeg'),
    date: 'May 29, 2025',
    category: 'Health Tips'
  }
];

// Default user info
const defaultUserInfo: UserInfo = {
  id: 'default',
  firstName: 'User',
  lastName: '',
  email: 'user@example.com',
  unreadNotifications: 0
};

export function useHomeData() {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
  const [healthNews, setHealthNews] = useState<HealthNewsItem[]>(mockHealthNews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUserData = useCallback(async () => {
    try {
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return defaultUserInfo;
      }

      if (!session?.user) {
        console.log('No authenticated user found');
        return defaultUserInfo;
      }

      // Fetch user profile from your profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles') // Assuming you have a profiles table
        .select('id, first_name, last_name, email')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Fall back to user metadata from auth
        return {
          id: session.user.id,
          firstName: session.user.user_metadata?.firstName || session.user.email?.split('@')[0] || 'User',
          lastName: session.user.user_metadata?.lastName || '',
          email: session.user.email || 'user@example.com',
          unreadNotifications: 0
        };
      }

      // Fetch unread notifications count
      const { count: notificationCount } = await supabase
        .from('notifications') // Assuming you have a notifications table
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('read', false);

      return {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        unreadNotifications: notificationCount || 0
      };

    } catch (err) {
      console.error('Error fetching user data:', err);
      return defaultUserInfo;
    }
  }, []);
  
  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch user data
      const userData = await fetchUserData();
      setUserInfo(userData);
      
      // Simulate fetching health news (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHealthNews(mockHealthNews);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch home data');
      console.error('Home data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUserData]);
  
  useEffect(() => {
    fetchHomeData();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchHomeData();
        } else if (event === 'SIGNED_OUT') {
          setUserInfo(defaultUserInfo);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchHomeData]);
  
  return {
    userInfo,
    healthNews,
    loading,
    error,
    fetchHomeData,
  };
}