import React from "react";
import { Provider } from "react-redux";
import { store, persistor } from "@/stores";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from "./navigations/Navigation";
import { PersistGate } from 'redux-persist/integration/react';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Navigation />
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
};

export default App;
