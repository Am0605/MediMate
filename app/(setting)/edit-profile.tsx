import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/config/supabase';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// Import components
import ProfilePhotoSection from '@/components/profile/ProfilePhotoSection';
import FormSection from '@/components/forms/FormSection';
import FormInput from '@/components/forms/FormInput';
import OptionSelector from '@/components/forms/OptionSelector';
import ErrorDisplay from '@/components/forms/ErrorDisplay';
import SubmitButton from '@/components/forms/SubmitButton';
import LoadingScreen from '@/components/LoadingScreen';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  height?: string;
  weight?: string;
  blood_type?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export default function EditProfile() {
  // States
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const router = useRouter();
  const colorScheme = useColorScheme();

  // Options
  const genderOptions = ['Male', 'Female'];
  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  const relationshipOptions = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other'];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setInitialLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          const profileData = {
            id: user.id,
            email: user.email || '',
            ...profile
          };
          
          setUserData(profileData);
          
          // Pre-fill form fields
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setPhone(profile.phone || '');
          setGender(profile.gender || '');
          setHeight(profile.height || '');
          setWeight(profile.weight || '');
          setBloodType(profile.blood_type || '');
          setEmergencyContactName(profile.emergency_contact_name || '');
          setEmergencyContactPhone(profile.emergency_contact_phone || '');
          setEmergencyContactRelationship(profile.emergency_contact_relationship || '');
          setAvatarUrl(profile.avatar_url || '');
          
          if (profile.date_of_birth) {
            setDateOfBirth(new Date(profile.date_of_birth));
          }
        } else {
          setUserData({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile data');
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      setError('First name is required');
      return false;
    }
    
    if (!lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    if (emergencyContactPhone && !/^\+?[\d\s\-\(\)]+$/.test(emergencyContactPhone)) {
      setError('Please enter a valid emergency contact phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (!userData) {
        throw new Error('No user data found');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          email: userData.email,
          phone: phone || null,
          date_of_birth: dateOfBirth.toISOString().split('T')[0],
          gender: gender || null,
          height: height || null,
          weight: weight || null,
          blood_type: bloodType || null,
          emergency_contact_name: emergencyContactName || null,
          emergency_contact_phone: emergencyContactPhone || null,
          emergency_contact_relationship: emergencyContactRelationship || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (initialLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Edit Profile',
          headerStyle: {
            backgroundColor: Colors[colorScheme].background,
          },
          headerTintColor: Colors[colorScheme].text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={[styles.scrollView, { backgroundColor: Colors[colorScheme].background }]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ErrorDisplay error={error} />

          <ProfilePhotoSection 
            avatarUrl={avatarUrl}
            onPickImage={pickImage}
          />

          {/* Basic Information */}
          <FormSection title="Basic Information">
            <View style={styles.row}>
              <FormInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                icon="person-outline"
                required
                flex={1}
              />
              <View style={{ width: 16 }} />
              <FormInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                required
                flex={1}
              />
            </View>

            <FormInput
              label="Email"
              value={userData?.email || ''}
              onChangeText={() => {}}
              placeholder="Email address"
              icon="mail-outline"
              editable={false}
              helperText="Email cannot be changed"
            />

            <FormInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              icon="call-outline"
              keyboardType="phone-pad"
            />

            <FormInput
              label="Date of Birth"
              value={formatDate(dateOfBirth)}
              onChangeText={() => {}}
              placeholder="Select date"
              icon="calendar-outline"
              rightIcon="chevron-down"
              onPress={() => setShowDatePicker(true)}
            />

            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )}

            <OptionSelector
              title="Gender"
              options={genderOptions}
              selectedValue={gender}
              onSelect={setGender}
            />
          </FormSection>

          {/* Health Information */}
          <FormSection title="Health Information">
            <View style={styles.row}>
              <FormInput
                label="Height (cm)"
                value={height}
                onChangeText={setHeight}
                placeholder="Height"
                icon="resize-outline"
                keyboardType="numeric"
                flex={1}
              />
              <View style={{ width: 16 }} />
              <FormInput
                label="Weight (kg)"
                value={weight}
                onChangeText={setWeight}
                placeholder="Weight"
                icon="fitness-outline"
                keyboardType="numeric"
                flex={1}
              />
            </View>

            <OptionSelector
              title="Blood Type"
              options={bloodTypeOptions}
              selectedValue={bloodType}
              onSelect={setBloodType}
            />
          </FormSection>

          {/* Emergency Contact */}
          <FormSection title="Emergency Contact">
            <FormInput
              label="Contact Name"
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
              placeholder="Emergency contact name"
              icon="person-add-outline"
            />

            <FormInput
              label="Contact Phone"
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              placeholder="Emergency contact phone"
              icon="call-outline"
              keyboardType="phone-pad"
            />

            {emergencyContactName && (
              <OptionSelector
                title="Relationship"
                options={relationshipOptions}
                selectedValue={emergencyContactRelationship}
                onSelect={setEmergencyContactRelationship}
              />
            )}
          </FormSection>

          <SubmitButton 
            onPress={handleSubmit}
            loading={loading}
            title="Save Changes"
          />

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
