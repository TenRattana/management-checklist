import React, { useCallback } from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { AccessibleView, Text } from "@/components";

const NotFoundScreen = () => {
  console.log("NotFoundScreen");

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <AccessibleView name="not-found" style={styles.container}>
        <Text style={styles.title}>Permission denied.</Text>
        <Link href="/screens/layouts/HomeScreen" style={styles.link}>
          <Text style={styles.linkText}>Go to Login screen!</Text>
        </Link>
      </AccessibleView>
    </>
  );
}

export default React.memo(NotFoundScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: '#1e90ff',
  },
});
