import React, { ReactNode, memo } from "react";
import { View, Platform, ViewStyle, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { useRes } from "@/app/contexts";

interface AccessibleViewProps {
    children: ReactNode;
    name: string;
    style?: ViewStyle | ViewStyle[];
}

// สร้างสไตล์ก่อนที่คอมโพเนนต์จะถูกเรียกใช้
const styles = StyleSheet.create({
    darkContainer: {
        color: '#f5f5f5',
        borderColor: '#f5f5f5',
    },
    lightContainer: {
        color: '#00000e',
        borderColor: '#00000e',
    },
});

const AccessibleView = ({ children, name, style }: AccessibleViewProps) => {
    const { darkMode } = useRes();
    // console.log("Acc");

    return (
        <View
            style={[style, darkMode ? styles.darkContainer : styles.lightContainer]}
            accessibilityLabel={name}
            aria-live="polite"
            accessible={Platform.OS !== "web"}
            testID={`view-${name}`}
        >
            {children}
        </View>
    );
};

const MemoizedAccessibleView = memo(AccessibleView);

MemoizedAccessibleView.propTypes = {
    children: PropTypes.node.isRequired,
    name: PropTypes.string.isRequired,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default MemoizedAccessibleView;
