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
    orientation: "sensor",
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
        hidden: true,
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
    },
    web: {
      bundler: "metro",
      output: "single",
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
      "assets/fonts/*",
      "assets/images/*",
      "node_modules/**/assets/**/*",
    ],
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 21,
            targetSdkVersion: 34,
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
        projectId: "bc86b091-c7d5-4991-bc17-90a632b8c05e",
      },
    },
    experiments: {
      typedRoutes: true,
    },
    jsEngine: "hermes",
  },
};
