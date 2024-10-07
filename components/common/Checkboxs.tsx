import React, { useEffect, useState } from "react";
import { Checkbox, HelperText } from "react-native-paper";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { CheckboxsProps } from "@/typing/tag";

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
  const [scale] = useState(new Animated.Value(1)); // Animated scale value

  useEffect(() => {
    // Initialize checkedOptions from value prop when it changes
    setCheckedOptions(value);
  }, [value]);

  const handleCheckBoxChange = (value: string) => {
    const newCheckedOptions = checkedOptions.includes(value)
      ? checkedOptions.filter((item) => item !== value) // Deselect
      : [...checkedOptions, value]; // Select

    setCheckedOptions(newCheckedOptions);
    handleChange(newCheckedOptions); // Pass the new checked options back to parent
  };

  const animateScaleIn = () => {
    Animated.spring(scale, {
      toValue: 1.1, // Scale up
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
    <View>
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
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={
                  checkedOptions.includes(item.value || '') ? "checked" : "unchecked"
                }
                onPress={() => handleCheckBoxChange(item.value || '')}
              />
              <Text style={styles.checkboxLabel}>{item.label}</Text>
            </View>
          </Animated.View>
        </Pressable>
      ))}

      {hint && <Text style={styles.hint}>{hint}</Text>}
      <HelperText type="error" visible={error} style={{ left: -10 }}>
        {errorMessage}
      </HelperText>
    </View>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
