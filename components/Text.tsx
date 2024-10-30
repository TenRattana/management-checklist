import React from 'react';
import { Text as DefaultText, TextProps as DefaultTextProps } from 'react-native';
import PropTypes from 'prop-types';

interface CustomTextProps extends DefaultTextProps {
  style?: any;
  children?: string | string[] | null;
}

const isThai = (text: string): boolean => {
  const thaiCharRange = /[\u0E00-\u0E7F]/;
  return thaiCharRange.test(text);
};

const Text: React.FC<CustomTextProps> = React.memo(({ style, children, ...props }) => {
  const textArray = Array.isArray(children) ? children : [children];

  return (
    <React.Fragment>
      {textArray.map((child, index) => {
        if (child == null) return null;
        const fontFamily = isThai(child) ? 'Sarabun' : 'Poppins';

        return (
          <DefaultText
            key={index}
            style={[{ fontFamily }, style]}
            {...props}
          >
            {child}
          </DefaultText>
        );
      })}
    </React.Fragment>
  );
});

Text.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string), PropTypes.any]),
};

export default Text;
