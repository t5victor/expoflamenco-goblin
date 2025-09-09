const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for static assets
config.resolver.assetExts.push('ico', 'png', 'jpg', 'jpeg', 'gif', 'svg');

module.exports = config;
