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
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/Icon-app.png",
        backgroundColor: "#ffffff",
      },
      package: "com.m_checklist_test",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/Icon-app.png",
      splitChunks: true,
      cache: true
    },
    assetBundlePatterns: ["assets/fonts/*", "assets/images/*"],
    plugins: [
      "expo-router",
      [
        "expo-secure-store",  
        {
          configureAndroidBackup: true,
          faceIDPermission:
            "Allow PMChecklist to access your Face ID biometric data.",
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
      enableMinification: environment === "production",
      eas: {
        projectId: "0f2240ee-c314-4fa4-b36a-6038aa1ba0da",
      },
    },
    experiments: {
      typedRoutes: true,
    },
    jsEngine: "hermes",
  },
};
