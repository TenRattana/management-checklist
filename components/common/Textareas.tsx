import React, { useMemo } from "react";
import { TextInput, HelperText } from "react-native-paper";
import { TextareasProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";
import { View } from "react-native";

const Textareas = React.memo(({ placeholder, label, error, errorMessage = "", value, handleChange, handleBlur, mode, hint, testId, exp }: TextareasProps) => {
    const masterdataStyles = useMasterdataStyles()

    const formattedLabel = useMemo(() => {
        return mode ? undefined : <Text style={masterdataStyles.text}>{label}</Text>;
    }, [label, mode]);

    return (
        <View id="text-areas" style={masterdataStyles.commonContainer}>
            <TextInput
                mode={mode || "outlined"}
                placeholder={placeholder}
                label={formattedLabel}
                style={[masterdataStyles.text, { paddingTop: 5 }]}
                onChangeText={handleChange}
                onBlur={handleBlur}
                value={String(value)}
                multiline
                numberOfLines={4}
                right={
                    value && !exp ? (
                        <TextInput.Icon
                            icon={"window-close"}
                            onPress={() => handleChange("")}
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

export default Textareas;
