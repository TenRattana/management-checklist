import React from "react";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { store } from "@/stores";
import { AuthProvider } from "@/app/contexts/auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Navigation from "@/app/navigations/Navigation";
import 'react-native-gesture-handler';

const App = () => {
  console.log("App");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Provider store={store}>
          <PaperProvider>
            <Navigation />
          </PaperProvider>
        </Provider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App