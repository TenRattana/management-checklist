import React from "react";
import { Text, Pressable } from "react-native";
import { RadioButton, HelperText } from "react-native-paper";
import { RadiosProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";
import useMasterdataStyles from "@/styles/common/masterdata";

const Radios = ({
  option,
  value,
  handleChange,
  hint,
  handleBlur,
  label,
  error,
  errorMessage,
  testId
}: RadiosProps) => {
  console.log("Radios");

  const masterdataStyles = useMasterdataStyles()

  if (!option || option.length === 0) {
    return null;
  }

  return (
    <AccessibleView name="radios" style={masterdataStyles.commonContainer}>
      {label && <Text style={masterdataStyles.label}>{label}</Text>}
      <RadioButton.Group
        onValueChange={handleChange}
        value={value as string}
      >
        {option.map((opt, index) => (
          <Pressable
            key={index}
            onPress={() => handleChange(opt.value)}
            style={{ flex: 1 }}
            testID={testId}
            id={testId}
          >
            <AccessibleView name="con-radio" style={[masterdataStyles.radioItem]}>
              <RadioButton value={opt.value} />
              <Text style={masterdataStyles.radioLabel}>{opt.label}</Text>
            </AccessibleView>
          </Pressable>
        ))}
      </RadioButton.Group>
      {hint ? <Text style={masterdataStyles.hint}>{hint}</Text> : false}
      {error ? (
        <HelperText type="error" visible={error} style={masterdataStyles.errorText}>
          {errorMessage}
        </HelperText>
      ) : false}
    </AccessibleView>
  );
};

export default Radios;
