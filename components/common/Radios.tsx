import React from "react";
import { Pressable, View } from "react-native";
import { RadioButton, HelperText } from "react-native-paper";
import { RadiosProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";

const Radios :React.FC<RadiosProps> = React.memo(({
  option,
  value,
  handleChange,
  hint,
  handleBlur,
  label,
  error,
  errorMessage,
  testId
}) => {
  console.log("Radios");

  const masterdataStyles = useMasterdataStyles()

  if (!option || option.length === 0) {
    return null;
  }

  return (
    <View id="radios" style={masterdataStyles.commonContainer}>
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
            <View id="con-radio" style={[masterdataStyles.radioItem]}>
              <RadioButton value={opt.value} />
              <Text style={masterdataStyles.radioLabel}>{opt.label}</Text>
            </View>
          </Pressable>
        ))}
      </RadioButton.Group>
      {hint ? <Text style={masterdataStyles.hint}>{hint}</Text> : false}
      {error ? (
        <HelperText type="error" visible={error} style={[{ display: error ? 'flex' : 'none' }, masterdataStyles.errorText]}>
          {errorMessage}
        </HelperText>
      ) : false}
    </View>
  );
});

export default Radios;
