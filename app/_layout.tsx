import '../global.js';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { supabase } from '@/config/supabase';
import { Session } from '@supabase/supabase-js';

import Colors from '@/constants/Colors';
import { ThemeProvider, useColorScheme } from '@/components/useColorScheme';
import { View, ActivityIndicator, Text } from 'react-native';

// Catch any errors thrown by the Layout component.
export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Change initial route to auth screens
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Simplified auth state manager
function AuthStateManager({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // Check if user has seen onboarding
  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_seen')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching onboarding status:', error);
        return false;
      }

      const hasSeen = data?.onboarding_seen || false;
      setHasSeenOnboarding(hasSeen);
      
      // Debug logging
      if (__DEV__) {
        console.log('📱 Onboarding Status:', { userId, hasSeen });
      }

      return hasSeen;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasSeenOnboarding(false);
      return false;
    }
  };

  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        await checkOnboardingStatus(session.user.id);
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔑 Auth Event:', event);
      setSession(session);
      
      if (session?.user) {
        await checkOnboardingStatus(session.user.id);
      } else {
        setHasSeenOnboarding(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen for database changes to user profile
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('📊 Profile Change:', payload);
          // Refetch onboarding status when profile changes
          checkOnboardingStatus(session.user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user]);

  // Navigation logic - minimal interference
  useEffect(() => {
    if (isLoading) return;

    const currentGroup = segments[0];

    // Debug logging
    if (__DEV__) {
      console.log('🧭 Navigation Check:', {
        hasSession: !!session,
        hasSeenOnboarding,
        currentGroup
      });
    }

    // Only redirect when necessary - don't interfere with normal navigation
    if (!session && currentGroup !== '(auth)') {
      // Not authenticated and not in auth - redirect to login
      console.log('🔄 Redirecting to login (no session)');
      router.replace('/(auth)/login');
    } else if (session && hasSeenOnboarding === false && currentGroup !== '(onboarding)') {
      // Authenticated but hasn't seen onboarding - redirect to onboarding
      console.log('🔄 Redirecting to onboarding (new user)');
      router.replace('/(onboarding)/welcome');
    } else if (session && hasSeenOnboarding === true && (currentGroup === '(auth)' || currentGroup === '(onboarding)')) {
      // Authenticated and has seen onboarding but in wrong area - redirect to main app
      console.log('🔄 Redirecting to main app (existing user)');
      router.replace('/(tabs)');
    }
    // Otherwise, let users navigate freely
  }, [session, hasSeenOnboarding, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return children;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
    ...Ionicons.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthStateManager>
        <RootLayoutNav />
      </AuthStateManager>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  
  // Customize the navigation theme to use our medical blue palette
  const navigationTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: Colors[colorScheme].tint,
      background: Colors[colorScheme].background,
      card: Colors[colorScheme].card,
      text: Colors[colorScheme].text,
      border: Colors[colorScheme].border,
      notification: Colors[colorScheme].notification,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(ai)" options={{ headerShown: false }} />
        <Stack.Screen name="(setting)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}