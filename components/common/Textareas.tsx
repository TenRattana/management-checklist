import React from "react";
import { View, Text } from "react-native";
import { TextInput, HelperText } from "react-native-paper";

interface TextareasProps {
    hint?: string;
    placeholder?: string;
    label?: string;
    error?: boolean;
    errorMessage?: string;
    value: string;
    handleChange: (value: string) => void;
    handleBlur?: () => void;
    mode?: "outlined" | "flat";
}

const Textareas: React.FC<TextareasProps> = ({
    placeholder,
    label,
    error,
    errorMessage = "",
    value,
    handleChange,
    handleBlur,
    mode = "outlined",
    hint
}) => {
    console.log("Inputmu,ti");

    return (
        <View>
            <TextInput
                mode={mode}
                placeholder={placeholder}
                label={label}
                onChangeText={handleChange}
                onBlur={handleBlur}
                value={value}
                multiline
                numberOfLines={4}
                right={
                    value ? (
                        <TextInput.Icon
                            icon={"window-close"}
                            onPress={() => handleChange("")}
                        />
                    ) : null
                }
                error={error}
                enterKeyHint="done"
            />
            {hint && <Text>{hint}</Text>}
            <HelperText type="error" visible={error} style={{ left: -10 }}>
                {errorMessage}
            </HelperText>
        </View>
    );
};

export default Textareas;
