import React from "react";
import { Text } from "react-native";
import { AccessibleView } from "@/components";

const HomeScreen = () => {
  return (
    <AccessibleView>
      <Text>Welcome Home</Text>
    </AccessibleView>
  );
}

export default React.memo(HomeScreen)
