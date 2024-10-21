import React from "react";
import { TextInput, HelperText } from "react-native-paper";
import { StyleSheet } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import { InputProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";

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
        mode={mode ||"outlined"}
        placeholder={placeholder}
        label={!mode && (
          <Text style={[masterdataStyles.text]}>
          {label}
        </Text>
        )}
        style={masterdataStyles.text}
        onChangeText={handleChange}
        onBlur={handleBlur}
        value={String(value)}
        right={
          value ? (
            <TextInput.Icon
              icon={"window-close"}
              onPress={() => handleChange("")}
            />
          ) : undefined
        }
        contentStyle={masterdataStyles.text}
        error={error}
        enterKeyHint="done"
        testID={testId}
        id={testId}
      />
      {hint ? <Text style={masterdataStyles.hint}>{hint}</Text> : false}
      <HelperText type="error" visible={error} style={{ display: error ? 'flex' : 'none', left: -10 }}>
        {errorMessage}
      </HelperText>
    </AccessibleView>
  );
};

export default React.memo(Inputs);

