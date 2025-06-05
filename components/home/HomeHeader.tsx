import React from 'react';
import { StyleSheet, Pressable, Platform } from 'react-native';
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
        <View style={[styles.profileCard, { backgroundColor: Colors[colorScheme].background }]}>
          <View style={[styles.profileIconBackground, { backgroundColor: Colors[colorScheme].background }]}>
            <Ionicons
              name="person-circle-outline"
              size={35}
              color={Colors[colorScheme].text}
            />
          </View>
        </View>
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
  },
  profileCard: {
    borderRadius: 25,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileIconBackground: {
    borderRadius: 20,
    padding: 1.5,
  },
});