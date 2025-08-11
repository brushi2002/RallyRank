const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web-specific resolver configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
