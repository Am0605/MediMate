import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface ProfilePhotoSectionProps {
  avatarUrl: string;
  onPickImage: () => void;
}

export default function ProfilePhotoSection({ avatarUrl, onPickImage }: ProfilePhotoSectionProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.photoSection, { backgroundColor: Colors[colorScheme].card }]}>
      <TouchableOpacity onPress={onPickImage} style={styles.photoContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.profilePhoto} />
        ) : (
          <View style={[styles.profilePhoto, styles.defaultPhoto]}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
        )}
        <View style={styles.photoOverlay}>
          <Ionicons name="camera" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
      <Text style={[styles.photoText, { color: Colors[colorScheme].textSecondary }]}>
        Tap to change photo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photoSection: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultPhoto: {
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    marginTop: 8,
    fontSize: 14,
  },
});