// Import the necessary polyfills
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const EXPO_PUBLIC_SUPABASE_URL = 'https://sukwwnwxohtwswonmnem.supabase.co';
const EXPO_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1a3d3bnd4b2h0d3N3b25tbmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Nzc3NjYsImV4cCI6MjA2NDI1Mzc2Nn0.s6bskbKYuPfSJbidAWdDStIsRMCq9shhQ0jLBJRlxX4';

export const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);