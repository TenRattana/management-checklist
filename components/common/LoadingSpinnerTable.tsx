import React from "react";
import { View } from "react-native";
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingSpinnerTable = () => {
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

  return (
    <View style={{ flex: 1, marginTop: 5, marginHorizontal: 10 }}>
      <ShimmerPlaceholder style={{ marginTop: 20, marginHorizontal: 10, height: '95%', width: '98%', borderRadius: 10 }} width={800} />
    </View>
  );
};

export default LoadingSpinnerTable;
