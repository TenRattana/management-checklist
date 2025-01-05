import "dotenv/config";

const getEnvVars = (env = "") => {
  switch (env) {
    case "production":
      return {
        apiUrl: process.env.EXPO_PUBLIC_API_URL,
        environment: process.env.EXPO_PUBLIC_APP_ENV,
      };
    case "development":
      return {
        apiUrl: process.env.EXPO_PUBLIC_API_URL,
        environment: process.env.EXPO_PUBLIC_APP_ENV,
      };
    default:
      return {
        apiUrl: process.env.EXPO_PUBLIC_API_URL,
        environment: process.env.EXPO_PUBLIC_APP_ENV,
      };
  }
};

const environment = process.env.EXPO_PUBLIC_API_URL || "development";

export default {
  expo: {
    name: "PMCheck List",
    platforms: ["ios", "android", "web"],
    slug: "pmchecklist",
    version: "1.0.0",
    sdkVersion: "51.0.0",
    orientation: "DEFAULT",
    icon: "./assets/images/Icon-app.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/Icon-app.png",
      resizeMode: "contain",
      backgroundColor: "#000",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mchecklisttest",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/Icon-app.png",
        backgroundColor: "#ffffff",
      },
      resourceClass: "medium",
      package: "com.m_checklist_test",
      permissions: ["CAMERA"],
      targetSdkVersion: 34,
      statusBar: {
        barStyle: "dark-content",
        backgroundColor: "#00000000",
        translucent: true,
      },
      navigationBar: {
        backgroundColor: "#00000000",
        barStyle: "dark-content",
      },
    },
    packagerOpts: {
      dev: false,
      minify: true,
      cache: true,
    },
    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
      // assetPatternsToBeBundled: [
      //   "assets/fonts/*",
      //   "assets/images/*",
      //   "assets/animations/*",
      //   "node_modules/react-native/**/*",
      // ],
    },
    web: {
      bundler: "metro",
      output: "Static",
      favicon: "./assets/images/Icon-app.png",
      splitChunks: true,
      cache: true,
      ServiceWorker: true,
      build: {
        html: "./public/index.html",
        development: false,
      },
    },
    assetBundlePatterns: [
      "fonts/*",
      "images/*",
      "animations/*",
      "node_modules/react-native/**/*",
    ],
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
      [
        "expo-secure-store",
        {
          configureAndroidBackup: true,
          faceIDPermission:
            "Allow PMChecklist to access your Face ID biometric data.",
        },
      ],
      [
        "expo-notifications",
        {
          color: "#ffffff",
          defaultChannel: "default",
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow PMChecklist to access your camera",
          microphonePermission: "Allow PMChecklist to access your microphone",
          recordAudioAndroid: true,
        },
      ],
    ],
    extra: {
      ...getEnvVars(environment),
      eas: {
        projectId: "6ae04db7-93f3-48cb-976a-e5b6558751df",
      },
    },
    experiments: {
      typedRoutes: true,
    },
    jsEngine: "hermes",
  },
};
