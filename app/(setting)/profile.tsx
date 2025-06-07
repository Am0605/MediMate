import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/config/supabase';
import { useColorScheme, useThemeControl } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

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

// Profile screen component
export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { setColorScheme } = useThemeControl();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch user data from Supabase
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserData({
            id: user.id,
            email: user.email || '',
            ...profile
          });
        } else {
          // If no profile exists, create basic one
          setUserData({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = (value: boolean) => {
    const newTheme = value ? 'dark' : 'light';
    setColorScheme(newTheme);
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Edit profile
  const navigateToEditProfile = () => {
    router.push('/(setting)/edit-profile');
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  const isDark = colorScheme === 'dark';

  return (
    <ScrollView 
      style={[
        styles.container, 
        {backgroundColor: Colors[colorScheme].background}
      ]}
    >
      <View style={[styles.header, {backgroundColor: Colors[colorScheme].card}]}>
        <Text style={[styles.headerTitle, {color: Colors[colorScheme].text}]}>Profile</Text>
      </View>
      
      {/* Profile Card */}
      <View style={[styles.profileCard, {backgroundColor: Colors[colorScheme].card}]}>
        <View style={styles.profileImageContainer}>
          {userData?.avatar_url ? (
            <Image 
              source={{ uri: userData.avatar_url }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={[styles.profileImage, styles.defaultAvatar]}>
              <Ionicons name="person" size={50} color="#fff" />
            </View>
          )}
        </View>
        
        <Text style={[styles.userName, {color: Colors[colorScheme].text}]}>
          {userData?.full_name || `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || 'User'}
        </Text>
        <Text style={[styles.userEmail, {color: Colors[colorScheme].text}]}>{userData?.email}</Text>
        
        <TouchableOpacity 
          style={[styles.editButton, {backgroundColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}
          onPress={navigateToEditProfile}
        >
          <Text style={[styles.editButtonText, {color: Colors[colorScheme].tint}]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information */}
      {userData && (userData.date_of_birth || userData.gender || userData.phone) && (
        <View style={[styles.section, {backgroundColor: Colors[colorScheme].card}]}>
          <Text style={[styles.sectionTitle, {color: Colors[colorScheme].text}]}>Personal Information</Text>
          
          {userData.date_of_birth && (
            <View style={[styles.infoRow, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
              <View style={styles.infoLeft}>
                <Ionicons name="calendar-outline" size={20} color={Colors[colorScheme].text} />
                <Text style={[styles.infoLabel, {color: Colors[colorScheme].text}]}>Date of Birth</Text>
              </View>
              <Text style={[styles.infoValue, {color: Colors[colorScheme].text}]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {formatDate(userData.date_of_birth)} ({calculateAge(userData.date_of_birth)} years)
              </Text>
            </View>
          )}

          {userData.gender && (
            <View style={[styles.infoRow, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
              <View style={styles.infoLeft}>
                <Ionicons name="person-outline" size={20} color={Colors[colorScheme].text} />
                <Text style={[styles.infoLabel, {color: Colors[colorScheme].text}]}>Gender</Text>
              </View>
              <Text style={[styles.infoValue, {color: Colors[colorScheme].text}]}>{userData.gender}</Text>
            </View>
          )}

          {userData.phone && (
            <View style={[styles.infoRow, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
              <View style={styles.infoLeft}>
                <Ionicons name="call-outline" size={20} color={Colors[colorScheme].text} />
                <Text style={[styles.infoLabel, {color: Colors[colorScheme].text}]}>Phone</Text>
              </View>
              <Text style={[styles.infoValue, {color: Colors[colorScheme].text}]}>{userData.phone}</Text>
            </View>
          )}
        </View>
      )}

      {/* Health Information */}
      {userData && (userData.height || userData.weight || userData.blood_type) && (
        <View style={[styles.section, {backgroundColor: Colors[colorScheme].card}]}>
          <Text style={[styles.sectionTitle, {color: Colors[colorScheme].text}]}>Health Information</Text>
          
          {userData.height && (
            <View style={[styles.infoRow, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
              <View style={styles.infoLeft}>
                <Ionicons name="resize-outline" size={20} color={Colors[colorScheme].text} />
                <Text style={[styles.infoLabel, {color: Colors[colorScheme].text}]}>Height</Text>
              </View>
              <Text style={[styles.infoValue, {color: Colors[colorScheme].text}]}>{userData.height} cm</Text>
            </View>
          )}

          {userData.weight && (
            <View style={[styles.infoRow, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
              <View style={styles.infoLeft}>
                <Ionicons name="fitness-outline" size={20} color={Colors[colorScheme].text} />
                <Text style={[styles.infoLabel, {color: Colors[colorScheme].text}]}>Weight</Text>
              </View>
              <Text style={[styles.infoValue, {color: Colors[colorScheme].text}]}>{userData.weight} kg</Text>
            </View>
          )}

          {userData.blood_type && (
            <View style={[styles.infoRow, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
              <View style={styles.infoLeft}>
                <Ionicons name="water-outline" size={20} color={Colors[colorScheme].text} />
                <Text style={[styles.infoLabel, {color: Colors[colorScheme].text}]}>Blood Type</Text>
              </View>
              <Text style={[styles.infoValue, {color: Colors[colorScheme].text}]}>{userData.blood_type}</Text>
            </View>
          )}
        </View>
      )}

      {/* Emergency Contact */}
      {userData && userData.emergency_contact_name && (
        <View style={[styles.section, {backgroundColor: Colors[colorScheme].card}]}>
          <Text style={[styles.sectionTitle, {color: Colors[colorScheme].text}]}>Emergency Contact</Text>
          
          <View style={[styles.infoRow, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
            <View style={styles.infoLeft}>
              <Ionicons name="person-add-outline" size={20} color={Colors[colorScheme].text} />
              <Text style={[styles.infoLabel, {color: Colors[colorScheme].text}]}>Name</Text>
            </View>
            <Text style={[styles.infoValue, {color: Colors[colorScheme].text}]}>{userData.emergency_contact_name}</Text>
          </View>

          {userData.emergency_contact_phone && (
            <View style={[styles.infoRow, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
              <View style={styles.infoLeft}>
                <Ionicons name="call-outline" size={20} color={Colors[colorScheme].text} />
                <Text style={[styles.infoLabel, {color: Colors[colorScheme].text}]}>Phone</Text>
              </View>
              <Text style={[styles.infoValue, {color: Colors[colorScheme].text}]}>{userData.emergency_contact_phone}</Text>
            </View>
          )}

          {userData.emergency_contact_relationship && (
            <View style={[styles.infoRow, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
              <View style={styles.infoLeft}>
                <Ionicons name="heart-outline" size={20} color={Colors[colorScheme].text} />
                <Text style={[styles.infoLabel, {color: Colors[colorScheme].text}]}>Relationship</Text>
              </View>
              <Text style={[styles.infoValue, {color: Colors[colorScheme].text}]}>{userData.emergency_contact_relationship}</Text>
            </View>
          )}
        </View>
      )}
      
      {/* Settings Section */}
      <View style={[styles.section, {backgroundColor: Colors[colorScheme].card}]}>
        <Text style={[styles.sectionTitle, {color: Colors[colorScheme].text}]}>Settings</Text>
        
        <View style={[styles.settingItem, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
          <View style={styles.settingTextContainer}>
            <Ionicons 
              name="notifications-outline" 
              size={24} 
              color={isDark ? '#ECEFF1' : '#555'} 
            />
            <Text style={[styles.settingText, {color: Colors[colorScheme].text}]}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: isDark ? '#455A64' : '#d0d0d0', true: Colors[colorScheme].tint }}
            thumbColor={'#fff'}
            ios_backgroundColor={isDark ? '#455A64' : '#d0d0d0'}
          />
        </View>
        
        <View style={[styles.settingItem, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
          <View style={styles.settingTextContainer}>
            <Ionicons 
              name="moon-outline" 
              size={24} 
              color={isDark ? '#ECEFF1' : '#555'} 
            />
            <Text style={[styles.settingText, {color: Colors[colorScheme].text}]}>Dark Mode</Text>
          </View>
          <Switch
            value={colorScheme === 'dark'}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: isDark ? '#455A64' : '#d0d0d0', true: Colors[colorScheme].tint }}
            thumbColor={'#fff'}
            ios_backgroundColor={isDark ? '#455A64' : '#d0d0d0'}
          />
        </View>
      </View>
      
      {/* Account Section */}
      <View style={[styles.section, {backgroundColor: Colors[colorScheme].card}]}>
        <Text style={[styles.sectionTitle, {color: Colors[colorScheme].text}]}>Account</Text>
        
        <TouchableOpacity style={[styles.menuItem, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
          <Ionicons 
            name="shield-checkmark-outline" 
            size={24} 
            color={isDark ? '#ECEFF1' : '#555'} 
          />
          <Text style={[styles.menuItemText, {color: Colors[colorScheme].text}]}>Privacy & Security</Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isDark ? '#78909C' : '#aaa'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
          <Ionicons 
            name="help-circle-outline" 
            size={24} 
            color={isDark ? '#ECEFF1' : '#555'} 
          />
          <Text style={[styles.menuItemText, {color: Colors[colorScheme].text}]}>Help & Support</Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isDark ? '#78909C' : '#aaa'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, {borderBottomColor: isDark ? '#1E3A5F' : '#f0f0f0'}]}>
          <Ionicons 
            name="document-text-outline" 
            size={24} 
            color={isDark ? '#ECEFF1' : '#555'} 
          />
          <Text style={[styles.menuItemText, {color: Colors[colorScheme].text}]}>Terms & Policies</Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isDark ? '#78909C' : '#aaa'} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, {color: isDark ? '#78909C' : '#999'}]}>MediMate v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 15,
    marginTop: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginTop: 10,
  },
  editButtonText: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    margin: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 15,
    margin: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  versionText: {
    color: '#999',
    fontSize: 14,
  },
});