const tintColorLight = '#1E88E5'; // Primary blue
const tintColorDark = '#64B5F6';  // Lighter blue for dark mode

export default {
  light: {
    text: '#263238',           // Dark blue-gray for text
    textSecondary: '#546E7A',  // Medium blue-gray for secondary text
    background: '#FFFFFF',     // White background
    tint: tintColorLight,      // Primary blue accent
    tabIconDefault: '#90A4AE', // Muted blue-gray for inactive tabs
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',           // White card background
    border: '#E0E0E0',         // Light gray borders
    notification: '#2196F3',   // Notification blue
    error: '#D32F2F',          // Error red
    success: '#43A047',        // Success green
    warning: '#FFA000',        // Warning amber
    info: '#0288D1',           // Info blue
    subtle: '#F5F9FC',         // Very light blue background
    highlight: '#E3F2FD',      // Light blue highlight
  },
  dark: {
    text: '#ECEFF1',           // Off-white text
    textSecondary: '#B0BEC5',  // Light blue-gray for secondary text
    background: '#0A1929',     // Dark blue background
    tint: tintColorDark,       // Light blue accent
    tabIconDefault: '#78909C', // Muted blue-gray for inactive tabs
    tabIconSelected: tintColorDark,
    card: '#132F4C',           // Dark blue card background
    border: '#1E3A5F',         // Medium blue borders
    notification: '#4FC3F7',   // Lighter notification blue
    error: '#EF5350',          // Lighter error red
    success: '#66BB6A',        // Lighter success green
    warning: '#FFB74D',        // Lighter warning amber
    info: '#29B6F6',           // Lighter info blue
    subtle: '#132F4C',         // Dark blue subtle background
    highlight: '#1E3A5F',      // Medium blue highlight
  },
};
