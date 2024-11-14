import React, { Profiler, useCallback, useMemo } from "react";
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

  const onRenderCallback = useCallback((
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    console.log(`ชื่อของ Profiler ${id} รองรับ: ${phase}`);
    console.log(`เวลาที่ใช้ในการ render component นี้: ${actualDuration}ms`);
    console.log(`เวลาที่คาดว่าจะใช้ในการ render: ${baseDuration}ms`);
    console.log(`เวลาเริ่มต้นที่เริ่ม render: ${startTime}`);
    console.log(`เวลาที่ commit การ render นี้: ${commitTime}`);
    console.log(`------------------------------------------------------------------------------`);
  }, []);

  return (
    <ImageBackground source={bgImage} style={styles.imageBackground} resizeMode="cover" >
      <View id="container-home" style={styles.container}>
        <Profiler id="selectedIndex === 0" onRender={onRenderCallback}></Profiler>
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
