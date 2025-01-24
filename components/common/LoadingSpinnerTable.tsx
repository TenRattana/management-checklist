import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import ShimmerPlaceholder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingSpinnerTable = () => {
  const [isReady, setIsReady] = useState(false);
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <View style={{ flex: 1, marginTop: 5, marginHorizontal: 10 }}>
      <ShimmerPlaceholder style={{ marginTop: 20, marginHorizontal: 10, height: '95%', width: '98%', borderRadius: 10 }} width={800} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingSpinnerTable;
