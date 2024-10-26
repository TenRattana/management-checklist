// import React from "react";
// import { Provider } from "react-redux";
// import { store } from "@/stores";
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import Navigation from "@/app/navigations/Navigation";
// import CustomErrorBoundary from "@/config/errors";


// const App = () => {
//   console.log("app");

//   return (
//     <Provider store={store}>
//       <GestureHandlerRootView style={{ flex: 1 }}>
//         <CustomErrorBoundary>
//           <Navigation />
//         </CustomErrorBoundary>
//       </GestureHandlerRootView>
//     </Provider>
//   );
// };

// export default App;

import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/stores";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View, Button } from "react-native";
import Navigation from "./navigations/Navigation";

interface CustomErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error, retry: () => void) => ReactNode;
}

class CustomErrorBoundary extends React.Component<CustomErrorBoundaryProps> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log("Error caught by ErrorBoundary:", error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View>
          <Text>Error: {this.state.error?.message}</Text>
          <Button title="Try Again" onPress={this.retry} />
        </View>
      );
    }

    return this.props.children;
  }
}


const App: React.FC = () => {
  const fallback = (error: Error, retry: () => void) => (
    <View>
      <Text>Error: {error.message}</Text>
      <Button title="Try Again" onPress={retry} />
    </View>
  );

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <CustomErrorBoundary fallback={fallback}>
          <Navigation />
        </CustomErrorBoundary>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;
