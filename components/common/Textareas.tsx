import React from "react";
import { TextInput, HelperText } from "react-native-paper";
import { TextareasProps } from "@/typing/tag";
import AccessibleView from "@/components/AccessibleView";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";
import { View } from "react-native";

const Textareas = ({
    placeholder,
    label,
    error,
    errorMessage = "",
    value,
    handleChange,
    handleBlur,
    mode,
    hint,
    testId
}: TextareasProps) => {
    console.log("Textareas");
    const masterdataStyles = useMasterdataStyles()

    return (
        <View id="text-areas" style={masterdataStyles.commonContainer}>
            <TextInput
                mode={mode || "outlined"}
                placeholder={placeholder}
                label={!mode ? (
                    <Text style={[masterdataStyles.text]}>
                        {label}
                    </Text>
                ) : undefined}
                style={[masterdataStyles.text, { paddingTop: 5 }]}
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
                    ) : undefined
                }
                error={error}
                enterKeyHint="done"
                testID={testId}
                id={testId}
            />
            {hint ? <Text style={masterdataStyles.hint}>{hint}</Text> : false}
            <HelperText type="error" visible={error} style={{ display: error ? 'flex' : 'none', left: -10 }}>
                {errorMessage}
            </HelperText>
        </View>
    );
};

export default Textareas;
