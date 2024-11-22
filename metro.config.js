const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts = [...defaultConfig.resolver.assetExts, "db"];

defaultConfig.reporter = {
  update: ({ type, message }) => {
    if (type === "warn") {
      if (message.includes("Require cycle") || true) {
        return;
      }
    }
  },
};

module.exports = defaultConfig;
