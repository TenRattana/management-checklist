import React from "react";
import { View, Platform, ViewStyle } from "react-native";

interface AccessibleViewProps {
    children: React.ReactNode;
    name?: string;
    style?: ViewStyle | ViewStyle[];
}

const AccessibleView: React.FC<AccessibleViewProps> = ({ children, name, style }) => {
    return (
        <View
            style={style}
            accessibilityLabel={name}
            accessible={Platform.OS !== 'web'}
            role={Platform.OS === 'web' ? 'region' : undefined}
        >
            {children}
        </View>
    );
};

export default AccessibleView;
