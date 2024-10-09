import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation } from "@react-navigation/native"

const Managepermissions = () => {

  const navigation = useNavigation();

  navigation.navigate("InputFormMachine", {
    machineId: "M001",
  });

  return (
    <View>
      <Text>Managepermissions</Text>
    </View>
  )
}

export default React.memo(Managepermissions)

const styles = StyleSheet.create({})