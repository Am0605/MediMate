// Import core polyfills first
// import 'web-streams-polyfill/es6';
import 'react-native-get-random-values';

// Then URL polyfills
import 'url-polyfill';
import 'react-native-url-polyfill/auto';

// Then any other global polyfills

// Import additional React Native compatible node libraries
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Make sure process is defined
if (typeof global.process === 'undefined') {
  global.process = require('process/browser');
}