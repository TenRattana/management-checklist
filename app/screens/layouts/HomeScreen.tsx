import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, ImageBackground, View } from "react-native";
import { Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { ScanQRProps } from "@/typing/tag";


const HomeScreen: React.FC<ScanQRProps> = React.memo(({ navigation }) => {
  const masterdataStyles = useMasterdataStyles();
  const bgImage = useMemo(() => require('../../../assets/images/bgs.jpg'), []);

  const handleSacnQR = useCallback(() => {
    navigation.navigate("ScanQR")
  }, []);

  return (
    <ImageBackground source={bgImage} style={styles.imageBackground} resizeMode="cover" >
      <View id="container-home" style={styles.container}>
        <View id="container-search" style={masterdataStyles.containerSearch}>
          <Pressable onPress={handleSacnQR} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Scan QR Code</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
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
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  content: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    borderRadius: 10,
  },
});
