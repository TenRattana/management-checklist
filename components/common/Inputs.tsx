import React from "react";
import { View } from "react-native";
import { TextInput, HelperText, Text } from "react-native-paper";

interface InputProps {
  placeholder?: string;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  value: string;
  handleChange: (text: string) => void;
  handleBlur?: () => void;
  hint?: string;
  mode?: "outlined" | "flat";
  lefticon?:string;
};

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
  lefticon
}) => {
  console.log("Input");

  return (
    <View>
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
      />
      {hint && <Text>{hint}</Text>}
      <HelperText type="error" visible={error} style={{ left: -10 }}>
        {errorMessage}
      </HelperText>
    </View>
  );
};

export default Inputs;
