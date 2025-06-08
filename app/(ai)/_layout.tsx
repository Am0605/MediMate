import { Stack } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function AILayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        headerTintColor: Colors[colorScheme].text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="symptom-checker" 
        options={{
          title: 'AI Symptom Checker',
        }}
      />
      <Stack.Screen 
        name="medsimplify" 
        options={{
          title: 'MedSimplify',
        }}
      />
      <Stack.Screen 
        name="vital-voice" 
        options={{
          title: 'Vital Voice',
        }}
      />
    </Stack>
  );
}