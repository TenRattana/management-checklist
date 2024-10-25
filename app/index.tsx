import React from "react";
import { Provider } from "react-redux";
import { store } from "@/stores";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from "@/app/navigations/Navigation";

const App = () => {
  console.log("app");

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigation />
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;
