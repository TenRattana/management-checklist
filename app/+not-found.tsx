import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { AccessibleView, Text } from "@/components";
import useMasterdataStyles from '@/styles/common/masterdata';
import { useTheme } from '@/app/contexts';

const NotFoundScreen = () => {
  console.log("NotFoundScreen");
  const masterdataStyle = useMasterdataStyles();
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: true }} />
      <AccessibleView name="not-found" style={styles.container}>
        <Text style={[masterdataStyle.title, { color: theme.colors.onBackground }]}>Permission denied.</Text>
        <Text style={styles.linkText}>Contact to Admin!</Text>
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
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: '#1e90ff',
  },
});
