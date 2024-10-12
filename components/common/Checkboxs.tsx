import React, { useEffect, useState } from "react";
import { Checkbox, HelperText } from "react-native-paper";
import { Text, StyleSheet, Animated, Pressable } from "react-native";
import { CheckboxsProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";
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
  const [scale] = useState<Animated.Value>(new Animated.Value(1));
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

  const animateScaleIn = () => {
    Animated.spring(scale, {
      toValue: 1.1,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const animateScaleOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  if (!option || option.length === 0) {
    return null;
  }

  return (
    <AccessibleView name="checkboxs" style={masterdataStyles.commonContainer}>
      {option.map((item, index) => (
        <Pressable
          key={index}
          onPressIn={animateScaleIn}
          onPressOut={animateScaleOut}
          onPress={() => {
            handleCheckBoxChange(item.value || '');
          }}
          testID={testId}
          id={testId}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
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
          </Animated.View>
        </Pressable>
      ))}

      {hint && <Text style={masterdataStyles.hint}>{hint}</Text>}
      <HelperText type="error" visible={error} style={{ left: -10 }}>
        {errorMessage}
      </HelperText>
    </AccessibleView>
  );
};

export default React.memo(Checkboxs);
