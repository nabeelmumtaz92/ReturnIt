const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /.*\.spec\.[jt]sx?$/,
  /.*\.test\.[jt]sx?$/,
  /__tests__\/.*/
];

module.exports = config;