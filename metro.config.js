const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,

  watchFolders: ["./app", "./components"],
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve(
      "react-native-qrcode-svg/textEncodingTransformation"
    ),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    enableBabelRCLookup: true,
    sourceMap: true,
  },
  resolver: {
    ...defaultConfig.resolver,
    blacklistRE: /node_modules\/.*\/node_modules\/react-native\/.*/,
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      "png",
      "jpg",
      "jpeg",
      "svg",
      "ttf",
      "otf",
    ],
  },
};
