import React, { useEffect, useState } from "react";
import { Checkbox, HelperText } from "react-native-paper";
import { Text, StyleSheet, Animated, Pressable } from "react-native";
import { CheckboxsProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";

const Checkboxs = ({
  option,
  value,
  handleChange,
  hint,
  error,
  errorMessage,
  testId
}: CheckboxsProps) => {
  const [checkedOptions, setCheckedOptions] = useState<string[]>([]);
  const [scale] = useState<Animated.Value>(new Animated.Value(1));
  console.log("Checkboxs");

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
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateScaleOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  if (!option || option.length === 0) {
    return null;
  }

  return (
    <AccessibleView>
      {option.map((item, index) => (
        <Pressable
          key={index}
          onPressIn={animateScaleIn}
          onPressOut={animateScaleOut}
          onPress={() => handleCheckBoxChange(item.value || '')}
          testID={testId}
          id={testId}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <AccessibleView style={styles.checkboxContainer}>
              <Checkbox
                status={
                  checkedOptions.includes(item.value || '') ? "checked" : "unchecked"
                }
                onPress={() => handleCheckBoxChange(item.value || '')}
              />
              <Text style={styles.checkboxLabel}>{item.label}</Text>
            </AccessibleView>
          </Animated.View>
        </Pressable>
      ))}

      {hint && <Text style={styles.hint}>{hint}</Text>}
      <HelperText type="error" visible={error} style={{ left: -10 }}>
        {errorMessage}
      </HelperText>
    </AccessibleView>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 10

  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    color: "#6e6e6e",
    marginTop: 5,
  },
});

export default React.memo(Checkboxs);
