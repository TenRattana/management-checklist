const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    ...defaultConfig.resolver,
    blacklistRE: /.*\/node_modules\/react-native-paper\/.*/,
    assetExts: [...defaultConfig.resolver.assetExts, "svg"],
  },
};
