import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AccessibleView } from '@/components';

const Managepermissions = () => {
  console.log("Managepermissions");

  return (
    <AccessibleView name="managepermssion">
      <Text>Managepermissions</Text>
    </AccessibleView>
  )
}

export default React.memo(Managepermissions)

const styles = StyleSheet.create({})