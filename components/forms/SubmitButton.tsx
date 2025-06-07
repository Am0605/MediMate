import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface SubmitButtonProps {
  onPress: () => void;
  loading: boolean;
  title: string;
  icon?: string;
}

export default function SubmitButton({ onPress, loading, title, icon = 'checkmark' }: SubmitButtonProps) {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity 
      style={[
        styles.submitButton, 
        { backgroundColor: Colors[colorScheme].tint },
        loading && styles.submitButtonDisabled
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Ionicons name={icon as any} size={20} color="#fff" />
          <Text style={styles.submitButtonText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});