import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation } from "@react-navigation/native";

const SettingScreen = () => {
  const navigation = useNavigation();

  navigation.navigate("InputFormMachine", {
    machineId: "M001",
  });

  return (
    <View>
      <Text>SettingScreen</Text>
    </View>
  )
}

export default React.memo(SettingScreen)

const styles = StyleSheet.create({})