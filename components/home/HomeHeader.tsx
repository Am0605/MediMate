import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { UserInfo } from '@/types/home';
import * as Haptics from 'expo-haptics';

type HomeHeaderProps = {
  userInfo: UserInfo;
};

export default function HomeHeader({ userInfo }: HomeHeaderProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/notifications');
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
  
  return (
    <View style={[styles.header, { backgroundColor: Colors[colorScheme].background }]}>
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeText, { color: Colors[colorScheme].text, opacity: 0.7 }]}>
          {getGreeting()},
        </Text>
        <Text style={[styles.userName, { color: Colors[colorScheme].text }]}>
          {formatUserName(userInfo.firstName, userInfo.lastName)}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.notificationIcon}
        onPress={handleNotificationPress}
      >
        <Ionicons name="notifications" size={24} color={Colors[colorScheme].text} />
        {userInfo.unreadNotifications > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>
              {userInfo.unreadNotifications > 99 ? '99+' : userInfo.unreadNotifications}
            </Text>
          </View>
        )}
      </TouchableOpacity>
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
  notificationIcon: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});