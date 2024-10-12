import React from "react";
import { TextInput, HelperText, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import { InputProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";

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
  const masterdataStyles = useMasterdataStyles();

  return (
    <AccessibleView
      name="inputs"
      style={masterdataStyles.commonContainer}
    >
      <TextInput
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
      {hint && <Text style={masterdataStyles.hint}>{hint}</Text>}
      <HelperText type="error" visible={error} style={{ left: -10 }}>
        {errorMessage}
      </HelperText>
    </AccessibleView>
  );
};

export default React.memo(Inputs);

