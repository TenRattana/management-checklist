import React, { ReactNode } from "react";
import { Text, View, Button } from "react-native";
interface CustomErrorBoundaryProps {
    children: ReactNode;
    fallback: (error: Error, retry: () => void) => ReactNode;
}

export class CustomErrorBoundary extends React.Component<CustomErrorBoundaryProps> {
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
