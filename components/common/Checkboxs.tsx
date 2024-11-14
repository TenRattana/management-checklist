import React, { useEffect, useState } from "react";
import { Checkbox, HelperText } from "react-native-paper";
import { TouchableOpacity, View } from "react-native";
import { CheckboxsProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";
import Text from "@/components/Text";
import useMasterdataStyles from "@/styles/common/masterdata";

const Checkboxs: React.FC<CheckboxsProps> = React.memo(({
  option,
  value,
  handleChange,
  handleBlur,
  hint,
  error,
  errorMessage,
  testId
}) => {
  const [checkedOptions, setCheckedOptions] = useState<string[]>([]);
  const masterdataStyles = useMasterdataStyles();

  useEffect(() => {
    if (typeof value === 'string') {
      setCheckedOptions(value.split(','));
    } else {
      setCheckedOptions(value || []);
    }
  }, [value, setCheckedOptions]);

  const handleCheckBoxChange = (itemValue: string) => {
    const newCheckedOptions = checkedOptions.includes(itemValue)
      ? checkedOptions.filter((item) => item !== itemValue)
      : [...new Set([...checkedOptions, itemValue])];

    setCheckedOptions(newCheckedOptions);
    handleChange(newCheckedOptions.join(','));
  };

  if (!option || option.length === 0) {
    return null;
  }

  return (
    <View id="checkboxs" style={masterdataStyles.commonContainer}>
      {option.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleCheckBoxChange(item.value || '')}
          testID={testId}
        >
          <View id="con-checkbox">
            <View id="group-checkboxs" style={masterdataStyles.checkboxContainer}>
              <Checkbox
                status={checkedOptions.includes(item.value || '') ? "checked" : "unchecked"}
                onPress={() => handleCheckBoxChange(item.value || '')}
              />
              <Text style={masterdataStyles.checkboxLabel}>{item.label}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {hint ? <Text style={masterdataStyles.hint}>{hint}</Text> : null}
      <HelperText type="error" visible={error} style={[{ display: error ? 'flex' : 'none' }, masterdataStyles.errorText]}>
        {errorMessage}
      </HelperText>
    </View>
  );
});

export default React.memo(Checkboxs);
