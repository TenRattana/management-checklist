import React, { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import Navigation from "@/app/navigations/Navigation";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from "react-redux";
import { store } from "@/stores";
import { AuthProvider } from "@/app/contexts/auth";
import { ToastProvider, ResponsiveProvider, ThemeProvider } from "@/app/contexts";


const App = () => {
  console.log("App");

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     if (global.performance && global.performance.memory) {
  //       const memoryUsage = global.performance.memory;
  //       console.log(`Memory Usage:
  //               Total JS Heap Size: ${memoryUsage.totalJSHeapSize / 1024 / 1024} MB,
  //               Used JS Heap Size: ${memoryUsage.usedJSHeapSize / 1024 / 1024} MB,
  //               JS Heap Size Limit: ${memoryUsage.jsHeapSizeLimit / 1024 / 1024} MB`);
  //     } else {
  //       console.warn('Memory usage information is not available. Consider using alternative monitoring tools.');
  //     }
  //   }, 1000);

  //   return () => clearInterval(intervalId);
  // }, []);

  return (
    <ToastProvider>
      <ResponsiveProvider>
        <ThemeProvider>
          <AuthProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <PaperProvider>
                <Provider store={store}>
                  <Navigation />
                </Provider>
              </PaperProvider>
            </GestureHandlerRootView>
          </AuthProvider>
        </ThemeProvider>
      </ResponsiveProvider>
    </ToastProvider>

  );
}

export default App;
