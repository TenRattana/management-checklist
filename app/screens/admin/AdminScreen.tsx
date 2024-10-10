import React from "react";
import { Text } from "react-native";
import AccessibleView from "@/components/AccessibleView";
console.log("AdminScreen");

const AdminScreen = () => {
  return (
    <AccessibleView>
      <Text>Admin Dashboard</Text>
    </AccessibleView>
  );
}

export default React.memo(AdminScreen)
