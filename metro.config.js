const { getDefaultConfig } = require("metro-config");

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig.getDefaultValues("react-native");

  return {
    transformer: {
      assetPlugins: [],
    },
    resolver: {
      assetExts: "",
      sourceExts: [],
    },
  };
})();
