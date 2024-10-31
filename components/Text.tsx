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

class Text extends React.Component<CustomTextProps> {
  static propTypes = {
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string), PropTypes.any]),
  };

  shouldComponentUpdate(nextProps: CustomTextProps) {
    return nextProps.style !== this.props.style || nextProps.children !== this.props.children;
  }

  render() {
    const { style, children, ...props } = this.props;

    return (
      <>
        {React.Children.map(children, (child, index) => {
          if (child == null) return null;

          const fontFamily = isThai(String(child)) ? 'Sarabun' : 'Poppins';

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
      </>
    );
  }
}

export default Text;
