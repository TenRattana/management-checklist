import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function InputFormMachine({ route }: any) {
  const { machineId } = route.params || {};

  return (
    <View>
      <Text>InputFormMachine</Text>
      <Text>{machineId}</Text>
    </View>
  )
}

const styles = StyleSheet.create({})