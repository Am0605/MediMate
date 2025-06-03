const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolution for modules
config.resolver.extraNodeModules = {
  // Empty modules for Node.js modules
  stream: require.resolve('stream-browserify'),
  https: require.resolve('./polyfills/empty-module.js'),
  http: require.resolve('./polyfills/empty-module.js'),
  zlib: require.resolve('./polyfills/empty-module.js'),
  fs: require.resolve('./polyfills/empty-module.js'),
  net: require.resolve('./polyfills/empty-module.js'),
  tls: require.resolve('./polyfills/empty-module.js'),
  crypto: require.resolve('react-native-get-random-values'),
};

module.exports = config;