import React from "react";
import { TextInput, HelperText, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import { InputProps } from "@/typing/tag";

const Inputs: React.FC<InputProps> = ({
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
}) => {

  return (
    <AccessibleView
      style={style.containerInput}
    >
      <TextInput
        style={{ flex: 1 }}
        mode={mode || "outlined"}
        placeholder={placeholder}
        label={label}
        onChangeText={handleChange}
        onBlur={handleBlur}
        value={value as string}
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

export default React.memo(Inputs);

const style = StyleSheet.create({
  containerInput: {
    marginVertical: 12,
    marginHorizontal: 12,
  }
})
