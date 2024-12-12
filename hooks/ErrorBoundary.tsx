import React from 'react';
import { Text } from 'react-native';

class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Error Boundary Caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <Text>Something went wrong. Please restart the app.</Text>;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
