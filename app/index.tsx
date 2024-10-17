import React from "react";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { store } from "@/stores";
import { AuthProvider } from "@/app/contexts/auth";
import Navigation from "@/app/navigations/Navigation";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider, ResponsiveProvider } from "@/app/contexts";

if (__DEV__) {
  const { getFlipper } = require('react-native-flipper');
  const flipper = getFlipper();
  flipper.addListener('someEvent', (data: any) => {
    console.log(data); // ข้อมูลจะถูกแสดงใน Flipper
  });
}

const App = () => {
  console.log("App");

  return (
    <ToastProvider>
      <ResponsiveProvider>
        <AuthProvider>
          <Provider store={store}>
            <PaperProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <Navigation />
              </GestureHandlerRootView>
            </PaperProvider>
          </Provider>
        </AuthProvider>
      </ResponsiveProvider>
    </ToastProvider>
  );
}

export default App;
