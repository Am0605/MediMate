import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/components/useColorScheme';

export default function SettingsLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTransparent: true,
          headerTintColor: colorScheme === 'dark' ? '#ECEFF1' : '#263238',
          contentStyle: { 
            backgroundColor: colorScheme === 'dark' ? '#0A1929' : '#FFFFFF',
          },
        }}
      >
        <Stack.Screen 
          name="profile" 
          options={{
            title: "Profile",
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="edit-profile" 
          options={{
            title: "Edit Profile",
            headerShown: true,
          }} 
        />
      </Stack>
    </>
  );
}