const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Suppress specific warnings
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    return url;
  },
};

module.exports = config;
