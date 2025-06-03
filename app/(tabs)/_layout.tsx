import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, Dimensions, Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: string;
  color: string;
  focused: boolean;
}) {
  const iconName = props.focused
    ? props.name
    : `${props.name}-outline`;

  return (
    <Ionicons
      name={iconName as any}
      size={24}
      style={{ marginBottom: Platform.OS === 'android' ? 0 : -3 }}
      color={props.color}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Header right profile icon component
  const ProfileIcon = () => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.profileIconContainer,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => router.push('/(setting)/profile')}
      >
        <Ionicons
          name="person-circle-outline"
          size={28}
          color={Colors[colorScheme ?? 'light'].text}
        />
      </Pressable>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        headerRight: () => <ProfileIcon />,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
          // Android-specific styling
          ...(Platform.OS === 'android' && {
            height: 65,
            paddingBottom: 20,
            paddingTop: 0,
          })
        },
        // Android-specific tab bar label style
        tabBarLabelStyle: Platform.OS === 'android' ? {
          paddingBottom: 8,
          fontSize: 12,
        } : undefined,
        // Android-specific tab bar icon style
        tabBarIconStyle: Platform.OS === 'android' ? {
          marginTop: 2,
        } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="button"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="finger-print" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="medication"
        options={{
          title: 'Medical',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="medical" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="four"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  profileIconContainer: {
    marginRight: 15,
    borderRadius: 20,
    padding: 3,
  },
});