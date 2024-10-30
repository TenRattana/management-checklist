import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "@/stores";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View, Button } from "react-native";
import Navigation from "./navigations/Navigation";
import { PersistGate } from 'redux-persist/integration/react';
import { CustomErrorBoundary } from "@/config/errors";

const App = () => {
  // const fallback = (error: Error, retry: () => void) => (
  //   <View>
  //     <Text>Error: {error.message}</Text>
  //     <Button title="Try Again" onPress={retry} />
  //   </View>
  // );

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* <CustomErrorBoundary fallback={fallback}> */}
            <Navigation />
          {/* </CustomErrorBoundary> */}
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
};

export default App;
