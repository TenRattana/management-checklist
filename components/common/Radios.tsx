import React, { useState } from "react";
import { Text, StyleSheet, Animated, Pressable } from "react-native";
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
  const [scale] = useState<Animated.Value>(new Animated.Value(1));
  console.log("Radios");

  const masterdataStyles = useMasterdataStyles()

  const animateScaleIn = () => {
    Animated.spring(scale, {
      toValue: 1.2,
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
    <AccessibleView name="radios" style={masterdataStyles.commonContainer}>
      {label && <Text style={masterdataStyles.label}>{label}</Text>}
      <RadioButton.Group
        onValueChange={handleChange}
        value={value as string}
      >
        {option.map((opt, index) => (
          <Pressable
            key={index}
            onPressIn={animateScaleIn}
            onPressOut={animateScaleOut}
            onPress={() => handleChange(opt.value)}
            style={{ flex: 1 }}
            testID={testId}
            id={testId}
          >
            <Animated.View style={[masterdataStyles.radioItem, { transform: [{ scale }] }]}>
              <RadioButton value={opt.value} />
              <Text style={masterdataStyles.radioLabel}>{opt.label}</Text>
            </Animated.View>
          </Pressable>
        ))}
      </RadioButton.Group>
      {hint && <Text style={masterdataStyles.hint}>{hint}</Text>}
      {error && (
        <HelperText type="error" visible={error} style={masterdataStyles.errorText}>
          {errorMessage}
        </HelperText>
      )}
    </AccessibleView>
  );
};

export default Radios;
