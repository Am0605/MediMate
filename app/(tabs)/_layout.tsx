import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, Dimensions, Platform, Image, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import FAB from '@/components/FAB';
import AIModal from '@/components/AIModal';

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
          marginBottom: Platform.OS === 'android' ? 0 : -3,
          transform: [{ scale: props.focused ? 1.1 : 1 }],
        }}
        color={props.color}
      />
      {props.focused && (
        <View style={[styles.focusIndicator, { backgroundColor: props.color }]} />
      )}
    </View>
  );
}

// Custom tab bar button with haptic feedback
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
      style={({ pressed }) => [
        otherProps.style,
        {
          transform: [{ scale: pressed ? 0.95 : 1 }],
          opacity: pressed ? 0.7 : 1,
        }
      ]}
      android_ripple={{ 
        color: 'rgba(0,0,0,0.1)', 
        borderless: false,
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

const ProfileIcon = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleProfilePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }
    router.push('/(setting)/profile');
  };

  return (
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
      <View style={[styles.profileIconBackground, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Ionicons
          name="person-circle-outline"
          size={28}
          color={Colors[colorScheme ?? 'light'].text}
        />
      </View>
    </Pressable>
  );
};

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
                height: 75,
                paddingBottom: 15,
                paddingTop: 8,
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
            marginTop: 2,
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
          name="profile"
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
    paddingVertical: 4,
  },
  tabIconFocused: {
    transform: [{ translateY: -2 }],
  },
  focusIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    ...Platform.select({
      ios: {
        bottom: -12,
      },
      android: {
        bottom: -12,
      },
    }),
  },
  fabTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        marginTop: -50, // Adjusted for the larger FAB
      },
      android: {
        marginTop: -30, // Adjusted for the larger FAB
      },
    }),
  },
  profileIconContainer: {
    marginRight: 15,
    padding: 5,
  },
  profileIconBackground: {
    borderRadius: 20,
    padding: 2,
  },
});