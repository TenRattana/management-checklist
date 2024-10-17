import React from "react";
import { Text } from "react-native";
import AccessibleView from "@/components/AccessibleView";

const SuperAdminScreen = () => {

  return (
    <AccessibleView name="superadmin">
      <Text>Welcome SuperAdminScreen</Text>
    </AccessibleView>
  );
}

export default React.memo(SuperAdminScreen)