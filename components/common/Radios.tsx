import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RadioButton, HelperText } from "react-native-paper";

interface Option {
  label:string;
  value:string;
}

interface RadiosProps {
  option?: Option[];
  label?:string;
  value: string; 
  handleChange: (selectedValues: string) => void; 
  hint?: string;
  handleBlur?: () => void;
  error?: boolean;
  errorMessage?: string;
}

const Radios: React.FC<RadiosProps> = ({
  option,
  value,
  handleChange,
  hint,
  handleBlur,
  label,
  error,
  errorMessage,
}) => {
  if (!option || option.length === 0) {
    return null;
  }
  
  return (
    <View>
      <RadioButton.Group
        onValueChange={handleChange}
        value={value}
      >
        {option.map((opt, index) => (
          <View key={index}>
            <RadioButton value={opt.label} />
            <Text>{opt.label}</Text>
          </View>
        ))}
      </RadioButton.Group>
      {hint && (
        <Text>{hint}</Text>
      )}
      <HelperText type="error" visible={error} style={{ left: -10 }}>
        {errorMessage}
      </HelperText>
    </View>
  );
};

export default Radios;
