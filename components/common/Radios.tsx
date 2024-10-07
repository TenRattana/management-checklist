import React, { useState } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { RadioButton, HelperText } from "react-native-paper";

interface Option {
  label: string;
  value: string;
}

interface RadiosProps {
  option?: Option[];
  label?: string;
  value: string;
  handleChange: (selectedValues: string) => void;
  hint?: string;
  handleBlur?: () => void;
  error?: boolean;
  errorMessage?: string;
  testId?:string;
}

const Radios: React.FC<RadiosProps> = ({
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
  const [scale] = useState(new Animated.Value(1)); 

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
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RadioButton.Group
        onValueChange={handleChange}
        value={value}
      >
        {option.map((opt, index) => (
          <Pressable
            key={index}
            onPressIn={animateScaleIn}
            onPressOut={animateScaleOut}
            onPress={() => handleChange(opt.value)}
            style={{flex:1}}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
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
