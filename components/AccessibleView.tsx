import React from "react";
import { View, Platform } from "react-native";

const AccessibleView = ({ children, name, style }: any) => {
    console.log("AccessibleView");

    return (
        <View
            style={style}
            accessibilityLabel={name}
            accessible={Platform.OS !== 'web'}
            role={Platform.OS === 'web' ? 'region' : undefined}
            testID={`view-${name}`}
        >
            {children}
        </View>
    );
};

export default React.memo(AccessibleView);
