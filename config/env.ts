import { Platform } from 'react-native';

const ENV = {
  // Gemini AI Configuration
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCiC29Cb0pvgu-EpmMmeDePtF_qTiSxEl4',
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
  
  // OCR Service Configuration
  OCR_SPACE_API_KEY: process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY || 'K89515575788957',
  OCR_SPACE_URL: 'https://api.ocr.space/parse/image',
  
  // Google Cloud Vision API (Updated validation)
  GOOGLE_CLOUD_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY || '',
  GOOGLE_VISION_URL: 'https://vision.googleapis.com/v1/images:annotate',
  
  // App Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development' || __DEV__,
  isProduction: process.env.NODE_ENV === 'production',
  
  // Platform Information
  platform: Platform.OS,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
  
  // API Configuration
  API_TIMEOUT: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
  
  // File Upload Limits
  MAX_IMAGE_SIZE_MB: 5,
  MAX_DOCUMENT_SIZE_MB: 10,
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  SUPPORTED_DOCUMENT_FORMATS: ['pdf', 'jpg', 'jpeg', 'png'],
  
  // Feature Flags
  FEATURES: {
    SYMPTOM_CHECKER: true,
    DOCUMENT_SCANNER: true,
    IMAGE_ANALYSIS: true,
    OFFLINE_MODE: false,
    ANALYTICS: process.env.NODE_ENV === 'production',
    DEBUG_LOGGING: process.env.NODE_ENV === 'development',
  },
  
  // Error Messages
  ERRORS: {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    API_KEY_MISSING: 'API configuration error. Please contact support.',
    IMAGE_TOO_LARGE: 'Image file is too large. Please choose a smaller image.',
    UNSUPPORTED_FORMAT: 'File format not supported. Please choose a different file.',
    ANALYSIS_FAILED: 'Analysis failed. Please try again.',
  },
};

// Updated validation function
export const validateEnvironment = (): {
  isValid: boolean;
  missingRequired: string[];
  missingOptional: string[];
  warnings: string[];
} => {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  if (!ENV.GEMINI_API_KEY || ENV.GEMINI_API_KEY === '' || ENV.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    missingRequired.push('EXPO_PUBLIC_GEMINI_API_KEY');
  }

  if (!ENV.OCR_SPACE_API_KEY || ENV.OCR_SPACE_API_KEY === '' || ENV.OCR_SPACE_API_KEY === 'your_ocr_space_api_key_here') {
    missingRequired.push('EXPO_PUBLIC_OCR_SPACE_API_KEY');
  }

  // Check Google Cloud Vision API (updated logic)
  const googleCloudKey = ENV.GOOGLE_CLOUD_API_KEY;
  if (!googleCloudKey || 
      googleCloudKey === '' || 
      googleCloudKey === 'your_google_cloud_vision_api_key_here' ||
      googleCloudKey === 'AIzaSyDgb2I9TW2jeppythTZAarfNRfiBLMLnm4' // Check if it's a placeholder
  ) {
    missingOptional.push('EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY');
    warnings.push('Google Cloud Vision API not configured - advanced OCR features will be limited');
  }

  // Development warnings
  if (ENV.isDevelopment) {
    if (ENV.GEMINI_API_KEY === 'AIzaSyCiC29Cb0pvgu-EpmMmeDePtF_qTiSxEl4') {
      warnings.push('Using default Gemini API key - consider setting your own for production');
    }
    
    if (ENV.OCR_SPACE_API_KEY === 'K89515575788957') {
      warnings.push('Using default OCR Space API key - consider setting your own for production');
    }
  }

  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    missingOptional,
    warnings,
  };
};

// Enhanced logging for debugging
export const logEnvironmentStatus = (): void => {
  if (!ENV.isDevelopment) return;

  console.log('🔧 MediMate Environment Configuration:');
  console.log(`   Platform: ${ENV.platform}`);
  console.log(`   Environment: ${ENV.NODE_ENV}`);
  
  // Debug: Log actual environment variable values (first few characters only for security)
  console.log('🔑 Environment Variables Debug:');
  console.log(`   GEMINI_API_KEY: ${ENV.GEMINI_API_KEY ? ENV.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT_SET'}`);
  console.log(`   OCR_SPACE_API_KEY: ${ENV.OCR_SPACE_API_KEY ? ENV.OCR_SPACE_API_KEY.substring(0, 10) + '...' : 'NOT_SET'}`);
  console.log(`   GOOGLE_CLOUD_API_KEY: ${ENV.GOOGLE_CLOUD_API_KEY ? ENV.GOOGLE_CLOUD_API_KEY.substring(0, 10) + '...' : 'NOT_SET'}`);
  
  const validation = validateEnvironment();
  
  if (validation.isValid) {
    console.log('✅ All required environment variables configured');
  } else {
    console.error('❌ Missing required environment variables:');
    validation.missingRequired.forEach(key => console.error(`   - ${key}`));
  }

  if (validation.missingOptional.length > 0) {
    console.warn('⚠️  Optional environment variables not set:');
    validation.missingOptional.forEach(key => console.warn(`   - ${key}`));
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    validation.warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
};

export default ENV;