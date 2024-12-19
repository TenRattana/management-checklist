import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(error: any): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Error Boundary Caught:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>Something went wrong. Please try again.</Text>
                    <Button title="Try Again" onPress={this.handleRetry} />
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8d7da',
        padding: 20,
    },
    errorMessage: {
        fontSize: 18,
        color: '#721c24',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default ErrorBoundary;
