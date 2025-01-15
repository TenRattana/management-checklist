import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ShimmerPlaceHolder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingPage = () => {
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsFetched(true);
    }, 3000);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ShimmerPlaceholder
        style={styles.shimmerBox}
        visible={isFetched}
      />
      <ShimmerPlaceHolder visible={isFetched}>
        <Text style={styles.text}>
          Wow, awesome here.
        </Text>
      </ShimmerPlaceHolder>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  shimmerBox: {
    height: 100,
    backgroundColor: '#dcdcdc',
    marginBottom: 20,
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});

export default LoadingPage;
