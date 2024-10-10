import React from "react";
import { Text, StyleSheet } from "react-native";
import { TextInput, HelperText } from "react-native-paper";
import { TextareasProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";

const Textareas = ({
    placeholder,
    label,
    error,
    errorMessage = "",
    value,
    handleChange,
    handleBlur,
    mode = "outlined",
    hint,
    testId
}: TextareasProps) => {
    console.log("Textareas");

    return (
        <AccessibleView name="text-areas" style={styles.container}>
            <TextInput
                mode={mode}
                placeholder={placeholder}
                label={label}
                onChangeText={handleChange}
                onBlur={handleBlur}
                value={value as string}
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
                style={styles.textInput}
                theme={{
                    colors: {
                        primary: '#6200ee',
                        placeholder: '#aaa',
                        text: '#000',
                    },
                }}
                testID={testId}
                id={testId}
            />
            {hint && <Text style={styles.hintText}>{hint}</Text>}
            <HelperText type="error" visible={error} style={styles.errorText}>
                {errorMessage}
            </HelperText>
        </AccessibleView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        paddingHorizontal: 10
    },
    textInput: {
        height: 120,
        borderRadius: 8,
        fontSize: 16,
        padding: 10,
    },
    hintText: {
        fontSize: 14,
        color: '#888',
        marginTop: 5,
    },
    errorText: {
        left: -10,
        fontSize: 14,
    },
});

export default Textareas;
