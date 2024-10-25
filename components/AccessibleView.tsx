import React, { ReactNode, memo } from "react";
import { View, Platform, ViewStyle, SafeAreaView } from "react-native";
import PropTypes from "prop-types";
import { useTheme } from "react-native-paper";

interface AccessibleViewProps {
  children?: ReactNode;
  name: string;
  style?: ViewStyle | ViewStyle[];
}

const AccessibleView = ({ children, name, style }: AccessibleViewProps) => {
  const theme = useTheme();

  return (
    <View
      style={[style, { flex: 1 }]}
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
  children: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const MemoizedAccessibleView = React.memo(AccessibleView);

export default MemoizedAccessibleView;
