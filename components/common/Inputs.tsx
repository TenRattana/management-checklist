import React, { useMemo, useState } from "react";
import { TextInput, HelperText } from "react-native-paper";
import { View } from "react-native";
import { InputProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";

const Inputs = React.memo(({ placeholder, label, error, errorMessage, value, handleChange, handleBlur, hint, mode, testId, textColor, secureTextEntry, exp }: InputProps) => {
  const masterdataStyles = useMasterdataStyles();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const formattedLabel = useMemo(() => {
    return mode ? undefined : <Text style={masterdataStyles.text}>{label}</Text>;
  }, [label, mode]);

  const { spacing } = useRes()
  const { theme } = useTheme()
  return (
    <View
      id="inputs"
      style={masterdataStyles.commonContainer}
    >
      <TextInput
        mode={mode || "outlined"}
        placeholder={placeholder}
        label={formattedLabel}
        textColor={textColor ? textColor : theme.colors.onBackground}
        style={{ fontSize: spacing.small }}
        onChangeText={handleChange}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry ? !passwordVisible : undefined}
        value={String(value)}
        right={
          value && !exp && !secureTextEntry ? (
            <TextInput.Icon
              icon="window-close"
              onPress={() => handleChange("")}
              size={spacing.large}
            />
          ) : secureTextEntry ? (
            <TextInput.Icon
              icon={passwordVisible ? 'eye-off' : 'eye'}
              onPress={togglePasswordVisibility}
              size={spacing.large}
            />
          ) : undefined
        }
        readOnly={exp}
        error={error}
        enterKeyHint="done"
        testID={testId}
        id={testId}
      />
      {hint ? <Text style={masterdataStyles.hint}>{hint}</Text> : false}
      <HelperText type="error" visible={error} style={[{ display: error ? 'flex' : 'none' }, masterdataStyles.errorText]}>
        {errorMessage}
      </HelperText>
    </View>
  );
});

export default Inputs;
