import React from "react";
import { Text as DefaultText, StyleSheet, TextProps as DefaultTextProps } from "react-native";

interface TextProps extends DefaultTextProps {
  style?: any;
}

const Text: React.FC<TextProps> = ({ style, ...props }) => {
  return <DefaultText style={[styles.text, style]} {...props} />;
};

export default React.memo(Text)

const styles = StyleSheet.create({
  text: {
    fontFamily: "Spacemono", 
  },
});
