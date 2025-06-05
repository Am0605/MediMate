import React from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface FABProps {
  onPress: () => void;
  icon?: string;
  size?: number;
}

export default function FAB({ onPress, icon = "sparkles", size = 26 }: FABProps) {
  const colorScheme = useColorScheme();

  const handleFABPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <View style={styles.fabContainer}>
      {/* ring indicator */}
      <View style={[
        styles.ringInner,
        { borderColor: Colors[colorScheme ?? 'light'].tint }
      ]} />
      
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
            transform: [{ scale: pressed ? 0.95 : 1 }],
            opacity: pressed ? 0.9 : 1,
          }
        ]}
        onPress={handleFABPress}
        android_ripple={{ 
          color: 'rgba(255,255,255,0.3)', 
          borderless: true,
          radius: 28
        }}
      >
        
        <View style={styles.iconContainer}>
          <Ionicons 
            name={icon as any} 
            size={size} 
            color="white"
            style={styles.icon}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringInner: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    opacity: 0.3,
    zIndex: -1,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.2)',
      },
      android: {
        elevation: 12,
      },
    }),
  },
  fabHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
});