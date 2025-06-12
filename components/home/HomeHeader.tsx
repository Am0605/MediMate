import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { UserInfo } from '@/types/home';
import { supabase } from '@/config/supabase';
import * as Haptics from 'expo-haptics';

type HomeHeaderProps = {
  userInfo: UserInfo;
};

export default function HomeHeader({ userInfo }: HomeHeaderProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    fetchUserAvatar();
    
    // Subscribe to profile changes via database changes
    const profileChannel = supabase
      .channel('home-header-profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userInfo.id}`,
        },
        (payload) => {
          console.log('🏠 Home Header - Profile DB Change:', payload);
          if (payload.new && 'avatar_url' in payload.new) {
            setAvatarUrl(payload.new.avatar_url);
          }
        }
      )
      .subscribe();

    // Subscribe to broadcast updates
    const broadcastChannel = supabase
      .channel('home-header-broadcasts')
      .on('broadcast', { event: 'profile_updated' }, (payload) => {
        console.log('📡 Home Header - Broadcast received:', payload);
        if (payload.payload.user_id === userInfo.id) {
          setAvatarUrl(payload.payload.avatar_url);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [userInfo.id]);

  const fetchUserAvatar = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }
  
      if (!user || !user.id) {
        console.log('No authenticated user found');
        return;
      }
  
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user.id)) {
        console.error('Invalid user ID format:', user.id);
        return;
      }
  
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
  
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error fetching avatar:', error);
        } else {
          console.log('No profile found for user');
        }
      } else {
        setAvatarUrl(profile?.avatar_url || null);
      }
    } catch (error) {
      console.error('Error fetching user avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }
    router.push('/(setting)/profile');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Function to format user name (only first two words or ellipse if too long)
  const formatUserName = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'User';
    
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    const words = fullName.split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return 'User';
    if (words.length === 1) return words[0];
    
    // Take first two words
    const displayName = `${words[0]} ${words[1]}`;
    
    // If the display name is too long (more than 15 characters), truncate and add ellipsis
    if (displayName.length > 15) {
      return displayName.substring(0, 12) + '...';
    }
    
    return displayName;
  };

  // Get user initials for fallback
  const getUserInitials = () => {
    const firstName = userInfo.firstName || '';
    const lastName = userInfo.lastName || '';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    if (firstInitial && lastInitial) {
      return firstInitial + lastInitial;
    } else if (firstInitial) {
      return firstInitial;
    } else if (userInfo.email) {
      return userInfo.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  const renderProfileImage = () => {
    if (loading) {
      return (
        <View style={[styles.defaultAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
          <Ionicons
            name="person"
            size={20}
            color="#fff"
          />
        </View>
      );
    }

    if (avatarUrl) {
      return (
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatarImage}
          onError={() => {
            console.log('Avatar image failed to load');
            setAvatarUrl(null);
          }}
        />
      );
    }

    // Fallback to initials
    return (
      <View style={[styles.defaultAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
        <Text style={styles.initialsText}>
          {getUserInitials()}
        </Text>
      </View>
    );
  };
  
  return (
    <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeText, { color: Colors[colorScheme ?? 'light'].text, opacity: 0.7 }]}>
          {getGreeting()},
        </Text>
        <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>
          {formatUserName(userInfo.firstName, userInfo.lastName)}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.profileIconContainer,
          {
            transform: [{ scale: pressed ? 0.9 : 1 }],
            opacity: pressed ? 0.7 : 1,
          }
        ]}
        onPress={handleProfilePress}
        android_ripple={{ 
          color: 'rgba(0,0,0,0.1)', 
          borderless: true,
          radius: 25
        }}
      >
        <View style={[styles.profileCard, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <View style={styles.profileImageContainer}>
            {renderProfileImage()}
          </View>
        </View>
        <View style={[styles.onlineIndicator, { borderColor: Colors[colorScheme ?? 'light'].background }]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileIconContainer: {
    marginLeft: 15,
    padding: 5,
    position: 'relative',
  },
  profileCard: {
    borderRadius: 25,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
        backgroundColor: 'transparent',
      },
    }),
  },
  profileImageContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
  },
  defaultAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: '#4CAF50',
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});