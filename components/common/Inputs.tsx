import React from "react";
import { TextInput, HelperText, Text } from "react-native-paper";
import { NativeSyntheticEvent, TextInputFocusEventData, StyleSheet } from "react-native";
import AccessibleView from "@/components/AccessibleView";

interface InputProps {
  placeholder?: string;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  value: string;
  handleChange: (text: string) => void;
  handleBlur?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  hint?: string;
  mode?: "outlined" | "flat";
  lefticon?: string;
  name?: string;
}

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
  name,
}) => {

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
        value={value}
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
        testID={name}
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
