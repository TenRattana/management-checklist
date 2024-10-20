import React, { useEffect, useState } from "react";
import { Checkbox, HelperText } from "react-native-paper";
import { Pressable } from "react-native";
import { CheckboxsProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";
import Text from "@/components/Text";
import useMasterdataStyles from "@/styles/common/masterdata";

const Checkboxs = ({
  option,
  value,
  handleChange,
  handleBlur,
  hint,
  error,
  errorMessage,
  testId
}: CheckboxsProps) => {
  const [checkedOptions, setCheckedOptions] = useState<string[]>([]);
  console.log("Checkboxs");
  const masterdataStyles = useMasterdataStyles();

  useEffect(() => {
    if (Array.isArray(value)) {
      setCheckedOptions(value);
    } else {
      setCheckedOptions(value ? [value] : []);
    }
  }, [value]);

  const handleCheckBoxChange = (value: string) => {
    const newCheckedOptions = checkedOptions.includes(value)
      ? checkedOptions.filter((item) => item !== value)
      : [...checkedOptions, value];

    setCheckedOptions(newCheckedOptions);
    handleChange(newCheckedOptions);
  };


  if (!option || option.length === 0) {
    return null;
  }

  return (
    <AccessibleView name="checkboxs" style={masterdataStyles.commonContainer}>
      {option.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => {
            handleCheckBoxChange(item.value || '');
          }}
          testID={testId}
          id={testId}
        >
          <AccessibleView name="con-checkbox">
            <AccessibleView name="group-checkboxs" style={masterdataStyles.checkboxContainer}>
              <Checkbox
                status={
                  checkedOptions.includes(item.value || '') ? "checked" : "unchecked"
                }
                onPress={() => {
                  handleCheckBoxChange(item.value || '');
                }}
              />
              <Text style={masterdataStyles.checkboxLabel}>{item.label}</Text>
            </AccessibleView>
          </AccessibleView>
        </Pressable>
      ))}

      {hint ? <Text style={masterdataStyles.hint}>{hint}</Text> : false}
      <HelperText type="error" visible={error} style={{ display: error ? 'flex' : 'none', left: -10 }}>
        {errorMessage}
      </HelperText>
    </AccessibleView>
  );
};

export default React.memo(Checkboxs);
