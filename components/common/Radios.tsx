import React from "react";
import { TouchableOpacity, View } from "react-native";
import { RadioButton, HelperText } from "react-native-paper";
import { RadiosProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";

const Radios = React.memo(({ option, value, handleChange, hint, label, error, errorMessage, testId, exp }: RadiosProps) => {
  const masterdataStyles = useMasterdataStyles()

  if (!option || option.length === 0) {
    return null;
  }

  return (
    <View id="radios" style={masterdataStyles.commonContainer}>
      {label && <Text style={masterdataStyles.label}>{label}</Text>}
      <RadioButton.Group
        onValueChange={(value: string) => !exp ? handleChange(value) : false}
        value={value as string}
      >
        {option.map((opt, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleChange(opt.value)}
            style={{ flex: 1 }}
            testID={testId}
            disabled={exp}
            id={testId}
          >
            <View id="con-radio" style={[masterdataStyles.radioItem]}>
              <RadioButton value={opt.value} />
              <Text style={masterdataStyles.radioLabel}>{opt.label}</Text>
            </View>
          </TouchableOpacity>
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
