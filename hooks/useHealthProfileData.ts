import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { HealthProfileData, HealthStats, HealthEntry, Medication } from '@/types/healthProfile';

export function useHealthProfileData() {
  const [healthProfile, setHealthProfile] = useState<HealthProfileData | null>(null);
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null);
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateAdherenceRate = (medications: Medication[]): number => {
    // This would typically come from medication logs/tracking
    // For now, return a calculated value based on active medications
    if (medications.length === 0) return 0;
    
    // Simulate adherence calculation - in real app, this would query medication logs
    const activeMeds = medications.filter(med => med.is_active);
    if (activeMeds.length === 0) return 100;
    
    // Mock calculation - replace with actual adherence tracking
    return Math.floor(Math.random() * (95 - 75) + 75);
  };

  const calculateHealthScore = (profile: HealthProfileData, medications: Medication[]): number => {
    let score = 100;
    
    // Deduct points for conditions
    const conditions = profile.conditions || [];
    score -= conditions.length * 10;
    
    // Deduct points for allergies
    const allergies = profile.allergies || [];
    score -= allergies.length * 5;
    
    // Age factor
    const age = calculateAge(profile.date_of_birth);
    if (age > 65) score -= 10;
    else if (age > 50) score -= 5;
    
    // Active medications factor
    const activeMeds = medications.filter(med => med.is_active);
    if (activeMeds.length > 5) score -= 10;
    else if (activeMeds.length > 3) score -= 5;
    
    return Math.max(score, 0);
  };

  const fetchHealthProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error('Authentication error: ' + userError.message);
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      console.log('🔍 Fetching health profile for user:', user.id);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to fetch profile: ' + profileError.message);
      }

      if (!profile) {
        // Create default profile if none exists
        const defaultProfile: Partial<HealthProfileData> = {
          id: user.id,
          user_id: user.id,
          first_name: user.user_metadata?.first_name || 'User',
          last_name: user.user_metadata?.last_name || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          date_of_birth: '1990-01-01',
          gender: 'Not specified',
          height: '5\'8"',
          weight: '150 lbs',
          blood_type: 'Unknown',
          conditions: [],
          allergies: [],
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([defaultProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw new Error('Failed to create profile: ' + createError.message);
        }

        setHealthProfile(newProfile as HealthProfileData);
      } else {
        // Transform profile data
        const healthProfileData: HealthProfileData = {
          id: profile.id,
          user_id: profile.id,
          first_name: profile.first_name || 'User',
          last_name: profile.last_name || '',
          full_name: profile.full_name || `${profile.first_name || 'User'} ${profile.last_name || ''}`.trim(),
          email: profile.email || user.email,
          date_of_birth: profile.date_of_birth || '1990-01-01',
          gender: profile.gender || 'Not specified',
          height: profile.height || '5\'8"',
          weight: profile.weight || '150 lbs',
          blood_type: profile.blood_type || 'Unknown',
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          conditions: profile.conditions || [],
          allergies: profile.allergies || [],
          emergency_contact_name: profile.emergency_contact_name,
          emergency_contact_phone: profile.emergency_contact_phone,
          emergency_contact_relationship: profile.emergency_contact_relationship,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };

        setHealthProfile(healthProfileData);
      }

      // Fetch medications
      const { data: medicationsData, error: medsError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (medsError) {
        console.error('Medications fetch error:', medsError);
        // Don't throw error, just log it
        setMedications([]);
      } else {
        setMedications(medicationsData || []);
      }

      // Fetch health entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('health_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (entriesError) {
        console.error('Health entries fetch error:', entriesError);
        setHealthEntries([]);
      } else {
        setHealthEntries(entriesData || []);
      }

      // Calculate health stats
      const currentProfile = profile || healthProfile;
      const currentMedications = medicationsData || [];
      
      if (currentProfile) {
        const stats: HealthStats = {
          totalMedications: currentMedications.filter(med => med.is_active).length,
          adherenceRate: calculateAdherenceRate(currentMedications),
          nextAppointment: undefined, // Would come from appointments table
          healthScore: calculateHealthScore(currentProfile as HealthProfileData, currentMedications),
          lastCheckup: '2025-05-15', // Would come from appointments/checkups table
          missedDoses: 0, // Would come from medication logs
          upcomingRefills: currentMedications.filter(med => 
            med.is_active && med.end_date && new Date(med.end_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          ).length,
        };

        setHealthStats(stats);
      }

      console.log('✅ Health profile data loaded successfully');

    } catch (err: any) {
      console.error('Error fetching health profile:', err);
      setError(err.message || 'Failed to fetch health profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateHealthProfile = async (updates: Partial<HealthProfileData>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setHealthProfile(data as HealthProfileData);
      console.log('✅ Health profile updated successfully');
      
    } catch (err: any) {
      console.error('Error updating health profile:', err);
      throw err;
    }
  };

  const addHealthEntry = async (entry: Omit<HealthEntry, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('health_entries')
        .insert([{
          ...entry,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setHealthEntries(prev => [data, ...prev]);
      console.log('✅ Health entry added successfully');
      
    } catch (err: any) {
      console.error('Error adding health entry:', err);
      throw err;
    }
  };
  
  useEffect(() => {
    fetchHealthProfile();

    // Set up real-time subscriptions
    const profileChannel = supabase
      .channel('health-profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('🔄 Profile updated:', payload);
          fetchHealthProfile();
        }
      )
      .subscribe();

    const medicationsChannel = supabase
      .channel('medications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medications',
        },
        (payload) => {
          console.log('🔄 Medications updated:', payload);
          fetchHealthProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(medicationsChannel);
    };
  }, [fetchHealthProfile]);
  
  return {
    healthProfile,
    healthStats,
    healthEntries,
    medications,
    loading,
    error,
    fetchHealthProfile,
    updateHealthProfile,
    addHealthEntry,
  };
}