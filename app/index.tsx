import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from "./navigations/Navigation";
import { NavigationContainer } from '@react-navigation/native';

const App = () => {
  console.log("App");

  return (
    <>
      <Navigation />
    </>
  );
};

export default App;