import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
    testId?:string;
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
    hint,
    testId
}) => {
    return (
        <View style={styles.container}>
            <TextInput
                mode={mode}
                placeholder={placeholder}
                label={label}
                onChangeText={handleChange}
                onBlur={handleBlur}
                value={value || ""}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10, // ระยะห่างระหว่างฟิลด์
    },
    textInput: {
        height: 120, // เพิ่มความสูงของ textarea
        backgroundColor: '#f5f5f5', // สีพื้นหลังของ textarea
        borderRadius: 8, // ขอบมน
        fontSize: 16, // ขนาดฟอนต์
        padding: 10, // ระยะห่างภายใน
    },
    hintText: {
        fontSize: 14, // ขนาดฟอนต์ของ hint
        color: '#888', // สีของ hint
        marginTop: 5,
    },
    errorText: {
        left: -10,
        fontSize: 14, // ขนาดฟอนต์ของข้อความ error
    },
});

export default Textareas;
