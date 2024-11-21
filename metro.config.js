const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.transformer.minifierConfig = {
  mangle: {
    reserved: ["__r", "__d", "__t", "__h"], // ป้องกันการหายไปของฟังก์ชันบางตัว
  },
};

defaultConfig.resolver.assetExts.push("db", "sqlite"); // รองรับไฟล์บางประเภท

module.exports = defaultConfig;
