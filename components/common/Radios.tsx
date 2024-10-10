import React, { useState } from "react";
import { Text, StyleSheet, Animated, Pressable } from "react-native";
import { RadioButton, HelperText } from "react-native-paper";
import { RadiosProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";

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

  const animateScaleIn = () => {
    Animated.spring(scale, {
      toValue: 1.2,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateScaleOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  if (!option || option.length === 0) {
    return null;
  }

  return (
    <AccessibleView style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
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
            <Animated.View style={[styles.radioItem, { transform: [{ scale }] }]}>
              <RadioButton value={opt.value} />
              <Text style={styles.radioLabel}>{opt.label}</Text>
            </Animated.View>
          </Pressable>
        ))}
      </RadioButton.Group>
      {hint && <Text style={styles.hint}>{hint}</Text>}
      {error && (
        <HelperText type="error" visible={error} style={styles.errorText}>
          {errorMessage}
        </HelperText>
      )}
    </AccessibleView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 10
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: "#6e6e6e",
    marginTop: 5,
  },
  errorText: {
    marginTop: 5,
  },
});

export default Radios;
