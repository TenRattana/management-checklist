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
    name: "m_checklist",
    slug: "m_checklist",
    version: "1.0.0",
    sdkVersion: "51.0.0",
    orientation: "landscape",
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
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/Icon-app.png",
      splitChunks: true,
      cache: true,
    },
    assetBundlePatterns: ["assets/fonts/*", "assets/images/*"],
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
        projectId: "0f2240ee-c314-4fa4-b36a-6038aa1ba0da",
      },
      updates: {
        assetPatternsToBeBundled: [
          "assets/images/**/*.png",
          "assets/images/**/*.jpg",
        ],
      },
    },
    experiments: {
      typedRoutes: true,
    },
    jsEngine: "hermes",
  },
};
