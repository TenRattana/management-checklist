import React from 'react';
import { Text as DefaultText, TextProps as DefaultTextProps } from 'react-native';
import { useRes } from '@/app/contexts';
import PropTypes from 'prop-types';
import { useTheme } from 'react-native-paper';

interface CustomTextProps extends DefaultTextProps {
  style?: any;
  children?: string | string[] | null;
}

const isThai = (text: string): boolean => {
  const thaiCharRange = /[\u0E00-\u0E7F]/;
  return thaiCharRange.test(text);
};

const Text: React.FC<CustomTextProps> = ({ style, children, ...props }) => {
  const theme = useTheme();
  const { spacing } = useRes();

  const textArray = Array.isArray(children) ? children : [children];

  return (
    <>
      {textArray.map((child, index) => {
        if (child === null || child === undefined) return null;
        const fontFamily = isThai(child) ? 'Sarabun' : 'Poppins';

        return (
          <DefaultText
            key={index}
            style={[{ fontFamily }, style, { fontSize: spacing.small }]}
            {...props}
          >
            {child}
          </DefaultText>
        );
      })}
    </>
  );
};

Text.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string), PropTypes.any]),
};

export default React.memo(Text);
