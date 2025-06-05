import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';

interface DocumentUploaderProps {
  onDocumentSelected: (imageUri: string, documentType: string) => void;
}

const documentTypes = [
  { id: 'prescription', label: 'Prescription', icon: 'medical', color: '#4F46E5' },
  { id: 'lab_report', label: 'Lab Report', icon: 'flask', color: '#DC2626' },
  { id: 'medical_report', label: 'Medical Report', icon: 'document-text', color: '#059669' },
  { id: 'discharge_summary', label: 'Discharge Summary', icon: 'clipboard', color: '#D97706' },
  { id: 'other', label: 'Other', icon: 'folder', color: '#6B7280' },
];

export default function DocumentUploader({ onDocumentSelected }: DocumentUploaderProps) {
  const colorScheme = useColorScheme();
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload documents.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const handleCameraPress = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const handleGalleryPress = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const handleDocumentPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleProcess = () => {
    if (!selectedImage || !selectedType) {
      Alert.alert(
        'Missing Information',
        'Please select a document image and document type before processing.',
        [{ text: 'OK' }]
      );
      return;
    }

    onDocumentSelected(selectedImage, selectedType);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      {/* Upload Options */}
      <View style={[styles.uploadSection, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Upload Document
        </Text>
        
        {!selectedImage ? (
          <View style={styles.uploadOptions}>
            <TouchableOpacity
              style={[styles.uploadButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
              onPress={handleCameraPress}
            >
              <Ionicons name="camera" size={32} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.uploadButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.uploadButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
              onPress={handleGalleryPress}
            >
              <Ionicons name="images" size={32} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.uploadButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                From Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.uploadButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
              onPress={handleDocumentPress}
            >
              <Ionicons name="folder" size={32} color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.uploadButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Browse Files
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
              onPress={handleRemoveImage}
            >
              <Ionicons name="close" size={20} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Document Type Selection */}
      <View style={[styles.typeSection, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Document Type
        </Text>
        
        <View style={styles.typeGrid}>
          {documentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                { 
                  backgroundColor: selectedType === type.id 
                    ? type.color + '20' 
                    : Colors[colorScheme ?? 'light'].background,
                  borderColor: selectedType === type.id 
                    ? type.color 
                    : Colors[colorScheme ?? 'light'].border,
                }
              ]}
              onPress={() => {
                setSelectedType(type.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons 
                name={type.icon as any} 
                size={24} 
                color={selectedType === type.id ? type.color : Colors[colorScheme ?? 'light'].textSecondary} 
              />
              <Text 
                style={[
                  styles.typeButtonText, 
                  { 
                    color: selectedType === type.id 
                      ? type.color 
                      : Colors[colorScheme ?? 'light'].text 
                  }
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Process Button */}
      <TouchableOpacity
        style={[
          styles.processButton,
          { 
            backgroundColor: selectedImage && selectedType 
              ? Colors[colorScheme ?? 'light'].tint 
              : Colors[colorScheme ?? 'light'].border,
          }
        ]}
        onPress={handleProcess}
        disabled={!selectedImage || !selectedType}
      >
        <Ionicons name="sparkles" size={20} color="white" />
        <Text style={styles.processButtonText}>
          Simplify Document
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  uploadSection: {
    borderRadius: 16,
    padding: 20,
  },
  typeSection: {
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  imagePreview: {
    position: 'relative',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  processButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});