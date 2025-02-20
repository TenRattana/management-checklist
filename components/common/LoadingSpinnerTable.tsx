import React from "react";
import { View } from "react-native";
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingSpinnerTable = () => {
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

  return (
    <View style={{ flex: 1 }}>
      <ShimmerPlaceholder style={{ marginTop: 15, marginHorizontal: 10, height: 35, width: '98%', borderRadius: 50 }} width={800} />
    </View>
  );
};

export default LoadingSpinnerTable;
