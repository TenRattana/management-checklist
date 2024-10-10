import React from "react";
import { Text } from "react-native";
import { AccessibleView } from "@/components";

const HomeScreen = () => {
  console.log("HomeScreen");

  return (
    <AccessibleView name="home">
      <Text>Welcome Home</Text>
    </AccessibleView>
  );
}

export default React.memo(HomeScreen)
