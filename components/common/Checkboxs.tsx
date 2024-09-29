import React, { useEffect, useState } from "react";
import { Checkbox, HelperText } from "react-native-paper";
import { View, Text, StyleSheet } from "react-native";

interface Option {
  label:string;
  value:string;
}

interface CheckboxsProps {
  option: Option[];
  value: string[]; 
  label?:string;
  handleChange: (selectedValues: string[]) => void; 
  hint?: string;
  handleBlur?: () => void;
  error?: boolean;
  errorMessage?: string;
}

const Checkboxs: React.FC<CheckboxsProps> = ({
  option,
  value,
  handleChange,
  hint,
  handleBlur,
  label,
  error,
  errorMessage,
}) => {
  const [checkedOptions, setCheckedOptions] = useState<string[]>([]);

  useEffect(() => {
    setCheckedOptions(value); 
  }, [value]);

  const handleCheckBoxChange = (value: string) => {
    const newCheckedOptions = checkedOptions.includes(value)
      ? checkedOptions.filter((item) => item !== value)
      : [...checkedOptions, value];

    setCheckedOptions(newCheckedOptions);
    handleChange(newCheckedOptions); 
  };

  if (!option || option.length === 0) {
    return null;
  }

  return (
    <View>
      {option.map((item, index) => (
        <View key={index}>
          <Checkbox
            status={
              checkedOptions.includes(item.value || '') ? "checked" : "unchecked" 
            }
            onPress={() => handleCheckBoxChange(item.value || '')} 
          />
          <Text>{item.label}</Text>
        </View>
      ))}

      {hint && <Text>{hint}</Text>} 
      <HelperText type="error" visible={error} style={{ left: -10 }}>
        {errorMessage}
      </HelperText>
    </View>
  );
};

export default Checkboxs;
