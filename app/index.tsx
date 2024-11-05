import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from "./navigations/Navigation";

const App = () => {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigation />
    </GestureHandlerRootView>
  );
};

export default App;