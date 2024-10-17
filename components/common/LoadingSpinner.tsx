import React from "react";
import { ActivityIndicator, MD2Colors } from "react-native-paper";

const LoadingSpinner = () => {
  // console.log("LoadingSpinner");

  return <ActivityIndicator animating={true} color={MD2Colors.red800} />;
};

export default React.memo(LoadingSpinner);
