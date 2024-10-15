import React, { ReactNode, memo } from "react";
import { View, Platform, ViewStyle, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { useRes } from "@/app/contexts";

interface AccessibleViewProps {
    children: ReactNode;
    name: string;
    style?: ViewStyle | ViewStyle[];
}

const AccessibleView = ({ children, name, style }: AccessibleViewProps) => {
    console.log("AccessibleView");
    const { darkMode } = useRes()

    const styles = StyleSheet.create({
        darkContainer: {
            backgroundColor: '#00000e',
            color: '#f5f5f5',
            borderColor: '#f5f5f5',

        },
        lightContainer: {
            // backgroundColor: '#f5f5f5',
            color: '#00000e',
            borderColor: '#00000e',
        },
    })

    return (
        <View
            style={[style, darkMode ? styles.darkContainer : styles.lightContainer]}
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
