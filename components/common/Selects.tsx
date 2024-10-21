import React from "react";
import { Picker } from "@react-native-picker/picker";
import { HelperText } from "react-native-paper";
import { Text, StyleSheet } from "react-native";
import { SelectsProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";
import useMasterdataStyles from "@/styles/common/masterdata";

const Selects = ({
  hint,
  option,
  value,
  handleChange,
  handleBlur,
  label,
  error,
  errorMessage,
  testId
}: SelectsProps) => {
  if (!option || option.length === 0) {
    return null;
  }
  console.log("Selects");
  const masterdataStyles = useMasterdataStyles()

  return (
    <AccessibleView name="selects" style={masterdataStyles.commonContainer}>
      {label ? <Text style={masterdataStyles.label}>{label}</Text> : false}
      <AccessibleView name="group-selects" style={masterdataStyles.dropdownContainer}>
        <Picker
          selectedValue={value}
          onValueChange={handleChange}
          onBlur={handleBlur}
          style={masterdataStyles.picker}
          itemStyle={masterdataStyles.text}
          testID={testId}
          id={testId}
        >
          <Picker.Item label="Select..."
            value=""
            style={masterdataStyles.text}
          />
          {option.map((item, index) => (
            <Picker.Item
              key={`value-${index}`}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </AccessibleView>
      {hint ? <Text style={masterdataStyles.hint}>{hint}</Text> : false}
      <HelperText type="error" visible={error} style={masterdataStyles.errorText}>
        {errorMessage}
      </HelperText>
    </AccessibleView>
  );
};

export default Selects;
