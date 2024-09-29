import React from "react";
import { Picker } from "@react-native-picker/picker";
import { HelperText } from "react-native-paper";
import { View, Text } from "react-native";

interface Option {
  label:string;
  value:string;
}

interface SelectsProps {
  option: Option[];
  label?:string;
  value: string; 
  handleChange: (selectedValues: string) => void; 
  hint?: string;
  handleBlur?: () => void;
  error?: boolean;
  errorMessage?: string;
}

const Selects : React.FC<SelectsProps> = ({
  hint,
  option,
  value,
  handleChange,
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
      <View>
        <Picker
          selectedValue={value}
          onValueChange={handleChange}
          onBlur={handleBlur}
        >
          <Picker.Item label="Select..." value="" />
          {option.map((item, index) => (
            <Picker.Item
              key={`value-${index}`}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>
      {hint && (
        <Text>{hint}</Text>
      )}
      <HelperText type="error" visible={error} style={{ left: -10 }}>
        {errorMessage}
      </HelperText>
    </View>
  );
};

export default Selects;
