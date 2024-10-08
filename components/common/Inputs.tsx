import React from "react";
import { TextInput, HelperText, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import { InputProps } from "@/typing/tag";

const Inputs = ({
  placeholder,
  label,
  error,
  errorMessage,
  value,
  handleChange,
  handleBlur,
  hint,
  mode,
  lefticon,
  testId
}: InputProps) => {

  return (
    <AccessibleView
      style={style.containerInput}
    >
      <TextInput
        mode={mode || "outlined"}
        placeholder={placeholder}
        label={label}
        onChangeText={handleChange}
        onBlur={handleBlur}
        value={value || ""}
        right={
          value ? (
            <TextInput.Icon
              icon={"window-close"}
              onPress={() => handleChange("")}
            />
          ) : undefined
        }
        error={error}
        enterKeyHint="done"
        testID={testId}
        id={testId}
      />
      {hint && <Text>{hint}</Text>}
      <HelperText type="error" visible={error} style={{ left: -10 }}>
        {errorMessage}
      </HelperText>
    </AccessibleView>
  );
};

export default Inputs;

const style = StyleSheet.create({
  containerInput: {
    marginVertical: 12,
    marginHorizontal: 12,
  }
})
