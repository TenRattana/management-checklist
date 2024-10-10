import React from "react";
import { Text } from "react-native";
import AccessibleView from "@/components/AccessibleView";

const SuperAdminScreen = () => {
  console.log("SuperAdminScreen");

  return (
    <AccessibleView>
      <Text>Welcome SuperAdminScreen</Text>
    </AccessibleView>
  );
}

export default React.memo(SuperAdminScreen)