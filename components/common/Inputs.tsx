import React, { useMemo } from "react";
import { TextInput, HelperText } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import { InputProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";

const Inputs: React.FC<InputProps> = React.memo(({
  placeholder,
  label,
  error,
  errorMessage,
  value,
  handleChange,
  handleBlur,
  hint,
  mode,
  testId
}) => {
  const masterdataStyles = useMasterdataStyles();

  const formattedLabel = useMemo(() => {
    return mode ? undefined : <Text style={masterdataStyles.text}>{label}</Text>;
  }, [label, mode]);

  return (
    <View
      id="inputs"
      style={masterdataStyles.commonContainer}
    >
      <TextInput
        mode={mode || "outlined"}
        placeholder={placeholder}
        label={formattedLabel}
        style={masterdataStyles.text}
        onChangeText={handleChange}
        onBlur={handleBlur}
        value={String(value)}
        right={
          value ? (
            <TextInput.Icon
              icon="window-close"
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
      <HelperText type="error" visible={error} style={[{ display: error ? 'flex' : 'none' }, masterdataStyles.errorText]}>
        {errorMessage}
      </HelperText>
    </View>
  );
});

export default Inputs;
