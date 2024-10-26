// import React from 'react';
// import { View, Text, Button } from 'react-native';

// class CustomErrorBoundary extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { hasError: false, error: null };
//     }

//     static getDerivedStateFromError(error) {
//         return { hasError: true, error };
//     }

//     componentDidCatch(error, errorInfo) {
//         console.log("Error caught by ErrorBoundary:", error, errorInfo);
//     }

//     retry = () => {
//         this.setState({ hasError: false, error: null });
//     };

//     render() {
//         if (this.state.hasError) {
//             return (
//                 <View>
//                     <Text>Error: {this.state.error.message}</Text>
//                     <Button title="Try Again" onPress={this.retry} />
//                 </View>
//             );
//         }

//         return this.props.children;
//     }
// }

// export default CustomErrorBoundary;
