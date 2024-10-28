import "dotenv/config";

const getEnvVars = (env = "") => {
  switch (env) {
    case "production":
      return {
        apiUrl: process.env.API_URL,
        environment: "production",
      };
    case "development":
    default:
      return {
        apiUrl: process.env.API_URL,
        environment: "development",
      };
  }
};

const environment = process.env.APP_ENV || "development";

export default {
  expo: {
    name: "m_checklist",
    slug: "m_checklist",
    version: "1.0.0",
    orientation: "landscape",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.m_checklist_test",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      packagerOpts: {
        dev: false
      }
    },
    assetBundlePatterns: [
      "assets/fonts/*",
    ],
    plugins: [
      "expo-router",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true,
        },
      ],
    ],
    extra: getEnvVars(environment),
    experiments: {
      typedRoutes: true,
    },
  },
};
