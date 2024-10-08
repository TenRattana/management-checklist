import React from "react";
import { AccessibleView } from "@/components";
import { Text } from "react-native";

const UserScreen = () => {
  return (
    <AccessibleView>
      <Text>User Dashboard</Text>
    </AccessibleView>
  );
};

export default React.memo(UserScreen)

