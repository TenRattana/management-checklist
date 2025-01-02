import React, { useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import { View, StyleSheet } from "react-native";

const LoadingSpinner = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LottieView
        source={require('@/assets/animations/Loading.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 200,
    height: 200,
  },
});

export default LoadingSpinner;
