import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, Dimensions, Platform, Image, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import FAB from '@/components/FAB';
import AIModal from '@/components/AIModal';
import { supabase } from '@/config/supabase';

const { width: screenWidth } = Dimensions.get('window');

function TabBarIcon(props: {
  name: string;
  color: string;
  focused: boolean;
}) {
  const iconName = props.focused
    ? props.name
    : `${props.name}-outline`;

  return (
    <View style={[styles.tabIconContainer, props.focused && styles.tabIconFocused]}>
      <Ionicons
        name={iconName as any}
        size={props.focused ? 26 : 24}
        style={{ 
          marginBottom: 0,
        }}
        color={props.color}
      />
      {props.focused && (
        <View style={[styles.focusIndicator, { backgroundColor: props.color }]} />
      )}
    </View>
  );
}

// Custom tab bar button with haptic feedback but no opacity changes
function TabBarButton(props: any) {
  const { onPress, ...otherProps } = props;
  
  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress && onPress();
  };
  
  return (
    <Pressable 
      {...otherProps} 
      onPress={handlePress}
      style={otherProps.style} // Remove transform and opacity changes
      android_ripple={{ 
        color: 'rgba(0,0,0,0.1)', 
        borderless: true, // Changed to true for better Android experience
        radius: 40
      }}
    />
  );
}

// FAB Tab Button Component using the FAB component
function FABTabButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.fabTabContainer}>
      <FAB 
        onPress={onPress} 
        icon="sparkles" 
        size={24} 
      />
    </View>
  );
}

function ProfileIcon() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState('U');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    console.log('🎯 Setting up real-time subscriptions for user:', currentUserId);

    // Subscribe to database changes
    const profileChannel = supabase
      .channel('tab-profile-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${currentUserId}`,
        },
        (payload) => {
          console.log('📋 Tab ProfileIcon - DB Change:', payload);
          fetchUserData(); // Refresh all data when profile changes
        }
      )
      .subscribe();

    // Subscribe to broadcast updates
    const broadcastChannel = supabase
      .channel('tab-profile-broadcasts')
      .on('broadcast', { event: 'profile_updated' }, (payload) => {
        console.log('📡 Tab ProfileIcon - Broadcast received:', payload);
        if (payload.payload.user_id === currentUserId) {
          setAvatarUrl(payload.payload.avatar_url);
          // Update initials if name changed
          if (payload.payload.full_name) {
            const names: string[] = payload.payload.full_name.split(' ').filter((name: string) => name.length > 0);
            let initials = 'U';
            if (names.length >= 2) {
              initials = names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
            } else if (names.length === 1) {
              initials = names[0].charAt(0).toUpperCase();
            }
            setUserInitials(initials);
          }
        }
      })
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up subscriptions');
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [currentUserId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user?.id) {
        console.log('No authenticated user found');
        return;
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user.id)) {
        console.error('Invalid user ID format:', user.id);
        return;
      }

      setCurrentUserId(user.id);
      console.log('👤 Fetching profile for user:', user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('avatar_url, first_name, last_name, full_name')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setUserInitials(user.email?.charAt(0).toUpperCase() || 'U');
        setAvatarUrl(null);
        return;
      }

      if (profile) {
        setAvatarUrl(profile.avatar_url);
        
        // Generate initials
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        const fullName = profile.full_name || '';
        
        let initials = 'U';
        
        if (firstName && lastName) {
          initials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
        } else if (firstName) {
          initials = firstName.charAt(0).toUpperCase();
        } else if (fullName) {
            const names: string[] = fullName.split(' ').filter((name: string) => name.length > 0);
          if (names.length >= 2) {
            initials = names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
          } else if (names.length === 1) {
            initials = names[0].charAt(0).toUpperCase();
          }
        } else if (user.email) {
          initials = user.email.charAt(0).toUpperCase();
        }
        
        setUserInitials(initials);
        console.log('✅ Tab Profile loaded:', { 
          hasAvatar: !!profile.avatar_url, 
          initials,
          avatarUrl: profile.avatar_url 
        });
      } else {
        setUserInitials(user.email?.charAt(0).toUpperCase() || 'U');
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserInitials('U');
      setAvatarUrl(null);
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

  const renderProfileImage = () => {
    if (loading) {
      return (
        <View style={[styles.defaultAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
          <Ionicons name="person" size={16} color="#fff" />
        </View>
      );
    }

    if (avatarUrl) {
      return (
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatarImage}
          onError={(error) => {
            console.log('Tab avatar image failed to load:', error.nativeEvent.error);
            setAvatarUrl(null);
          }}
          onLoad={() => {
            console.log('Avatar image loaded successfully');
          }}
        />
      );
    }

    // Fallback to initials
    return (
      <View style={[styles.defaultAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
        <Text style={styles.initialsText}>
          {userInitials}
        </Text>
      </View>
    );
  };

  return (
    <Pressable
      style={styles.profileIconContainer} // Remove transform and opacity
      onPress={handleProfilePress}
      android_ripple={{ 
        color: 'rgba(0,0,0,0.1)', 
        borderless: true,
        radius: 25
      }}
    >
      <View style={[styles.profileIconBackground, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.avatarContainer}>
          {renderProfileImage()}
          {/* Optional online indicator - only show when not loading */}
          {!loading && (
            <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleFABPress = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
          headerShown: useClientOnlyValue(false, true),
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderTopColor: Colors[colorScheme ?? 'light'].border,
            borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
            position: 'relative',
            ...Platform.select({
              ios: {
                height: 90,
                paddingBottom: 25,
                paddingTop: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              },
              android: {
                height: 80, // Increased height for better icon spacing
                paddingBottom: 12, // Reduced padding
                paddingTop: 12, // Increased top padding
                elevation: 8,
              },
            }),
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            ...Platform.select({
              ios: {
                paddingTop: 4,
              },
              android: {
                paddingBottom: 5,
                marginTop: -2,
              },
            }),
          },
          tabBarIconStyle: Platform.OS === 'android' ? {
            marginTop: 0, // Remove margin to prevent clipping
            marginBottom: 0,
          } : {
            marginBottom: -2,
          },
          tabBarButton: (props) => <TabBarButton {...props} />,
          headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: Colors[colorScheme ?? 'light'].text,
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={{ width: 28, height: 28, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors[colorScheme ?? 'light'].tint }}>MediMate</Text>
              </View>
            ),
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="home" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: '',
            headerLeft: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={{ width: 28, height: 28, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors[colorScheme ?? 'light'].tint }}>MediMate</Text>
              </View>
            ),
            headerRight: () => <ProfileIcon />,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="calendar" color={color} focused={focused} />
            ),
          }}
        />
        
        {/* FAB as middle tab */}
        <Tabs.Screen
          name="ai-fab"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon: () => null,
            tabBarButton: () => <FABTabButton onPress={handleFABPress} />,
          }}
        />
        
        <Tabs.Screen
          name="medication"
          options={{
            title: '',
            headerLeft: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={{ width: 28, height: 28, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors[colorScheme ?? 'light'].tint }}>MediMate</Text>
              </View>
            ),
            headerRight: () => <ProfileIcon />,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="medical" color={color} focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="health-profile"
          options={{
            title: '',
            headerLeft: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={{ width: 28, height: 28, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors[colorScheme ?? 'light'].tint }}>MediMate</Text>
              </View>
            ),
            headerRight: () => <ProfileIcon />,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="person" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
      
      <AIModal visible={isModalVisible} onClose={handleModalClose} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: Platform.OS === 'android' ? 8 : 4, // More padding on Android
    paddingHorizontal: 4, // Add horizontal padding
    minHeight: 40, // Ensure minimum touch target
  },
  tabIconFocused: {
    transform: [{ translateY: Platform.OS === 'android' ? 0 : -2 }], // No transform on Android
  },
  focusIndicator: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 2 : -8, // Position better on Android
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  fabTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        marginTop: -50, 
      },
      android: {
        marginTop: -25, // Reduced margin for Android
      },
    }),
  },
  profileIconContainer: {
    marginRight: 15,
    padding: 5,
    // Remove all transform and opacity styles
  },
  profileIconBackground: {
    borderRadius: 20,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
});