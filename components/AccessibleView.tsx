import React, { ReactNode, memo } from "react";
import { View, Platform } from "react-native";
import PropTypes from "prop-types";

interface AccessibleViewProps {
    children: ReactNode;
    name: string;
    style?: any;
}

const AccessibleView = ({ children, name, style }: AccessibleViewProps) => {
    console.log("AccessibleView");

    return (
        <View
            style={style}
            accessibilityLabel={name}
            accessible={Platform.OS !== "web"}
            testID={`view-${name}`}
        >
            {children}
        </View>
    );
};

const MemoizedAccessibleView = memo(AccessibleView) as React.FC<AccessibleViewProps> & {
    propTypes?: any;
};

MemoizedAccessibleView.propTypes = {
    children: PropTypes.node.isRequired,
    name: PropTypes.string.isRequired,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MemoizedAccessibleView;
