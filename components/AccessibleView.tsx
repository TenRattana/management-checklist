import React, { ReactNode, memo } from "react";
import { View, Platform, ViewStyle } from "react-native";
import PropTypes from "prop-types";
import { useTheme } from "@/app/contexts"

interface AccessibleViewProps {
  children?: ReactNode;
  name: string;
  style?: ViewStyle | ViewStyle[];
}

const AccessibleView = ({ children, name, style }: AccessibleViewProps) => {
  const { theme } = useTheme(); 

  return (
    <View
      style={[style, { backgroundColor: theme.background , color:theme.color }]} 
      accessibilityLabel={name}
      aria-live="polite"
      accessible={Platform.OS !== "web"}
      testID={`view-${name}`}
    >
      {children ?? null}
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
