import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}