import React from 'react';
import { Text as DefaultText, StyleSheet, TextProps as DefaultTextProps } from 'react-native';

interface CustomTextProps extends DefaultTextProps {
  style?: any;
  children?: string;
}

const isThai = (text: string): boolean => {
  const thaiCharRange = /[\u0E00-\u0E7F]/;  
  return thaiCharRange.test(text);
};

const Text: React.FC<CustomTextProps> = ({ style, children, ...props }) => {
  const fontFamily = isThai(children ?? "") ? 'Sarabun' : 'Poppins'; 

  return (
    <DefaultText style={[styles.text, { fontFamily }, style]} {...props}>
      {children}
    </DefaultText>
  );
};

export default React.memo(Text)

const styles = StyleSheet.create({
  text: {
    fontSize: 16, 
  },
});
