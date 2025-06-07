import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface ErrorDisplayProps {
  error: string | null;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
  },
});