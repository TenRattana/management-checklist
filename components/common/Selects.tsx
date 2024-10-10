import React from "react";
import { Picker } from "@react-native-picker/picker";
import { HelperText } from "react-native-paper";
import { Text, StyleSheet } from "react-native";
import { SelectsProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";

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

  return (
    <AccessibleView style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <AccessibleView style={styles.dropdownContainer}>
        <Picker
          selectedValue={value}
          onValueChange={handleChange}
          onBlur={handleBlur}
          style={styles.picker}
          testID={testId}
          id={testId}
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
      </AccessibleView>
      {hint && <Text style={styles.hint}>{hint}</Text>}
      <HelperText type="error" visible={error} style={styles.errorText}>
        {errorMessage}
      </HelperText>
    </AccessibleView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 10
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    fontSize: 18,
  },
  hint: {
    fontSize: 16,
    marginTop: 5,
    color: '#777',
  },
  errorText: {
    left: -10,
    fontSize: 16,
  },
});

export default Selects;
