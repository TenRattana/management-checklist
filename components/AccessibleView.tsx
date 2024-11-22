import React, { ReactNode } from "react";
import { View, Platform, ViewStyle } from "react-native";
import PropTypes from "prop-types";
import { useTheme } from "@/app/contexts/useTheme";

interface AccessibleViewProps {
  children?: ReactNode;
  name: string;
  style?: ViewStyle | ViewStyle[];
}

const AccessibleView = ({ children, name, style }: AccessibleViewProps) => {
  const { theme } = useTheme();

  return (
    <View
      style={[style, { backgroundColor: theme.colors.background }]}
      accessibilityLabel={name}
      aria-live="polite"
      accessible={Platform.OS !== "web"}
      testID={`view-${name}`}
      id={name}
    >
      {children ?? null}
    </View>
  );
};

AccessibleView.propTypes = {
  children: PropTypes.oneOfType([PropTypes.any]),
  name: PropTypes.string.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const MemoizedAccessibleView = React.memo(AccessibleView);

export default MemoizedAccessibleView;
