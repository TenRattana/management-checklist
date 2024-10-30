import React, { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { AccessibleView, Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { ScanQRProps } from "@/typing/tag";

const HomeScreen: React.FC<ScanQRProps> = React.memo(({ navigation }) => {
  const masterdataStyles = useMasterdataStyles();

  const handleSacnQR = useCallback(() => {
    navigation.navigate("ScanQR")
  }, []);


  return (
    <AccessibleView name="container-home" style={styles.container}>
      <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
        <Pressable onPress={handleSacnQR} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
          <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Scan QR Code</Text>
        </Pressable>
      </AccessibleView>

    </AccessibleView>
  );
});

export default HomeScreen;

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
