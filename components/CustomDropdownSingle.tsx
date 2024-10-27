import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, HelperText } from "react-native-paper";
import { Dropdown } from 'react-native-element-dropdown';
import AccessibleView from "@/components/AccessibleView";
import { CustomDropdownSingleProps } from '@/typing/tag'
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";

const CustomDropdownSingle = ({
    labels,
    values,
    title,
    data,
    value,
    handleBlur,
    handleChange,
    lefticon,
    iconRight,
    testId,
    error,
    errorMessage,
}: CustomDropdownSingleProps) => {
    const [options, setOptions] = useState<{ label?: string; value?: string; icon?: () => JSX.Element }[]>([]);
    const masterdataStyles = useMasterdataStyles();

    console.log("CustomDropdownSingleProps");

    const processData = useCallback(() => {
        if (data && Array.isArray(data)) {
            return data.map((item) => ({
                label: item[labels] || "",
                value: item[values] || "",
                icon: item.icon ? item.icon : undefined,
            }));
        }
        return [];
    }, [data, labels, values]);

    useEffect(() => {
        const newOptions = processData();
        setOptions(newOptions);
    }, [processData]);

    return (
        <View id="customdropdown-single" style={masterdataStyles.commonContainer}>
            <Dropdown
                style={masterdataStyles.dropdown}
                placeholderStyle={masterdataStyles.placeholderStyle}
                selectedTextStyle={masterdataStyles.selectedTextStyle}
                inputSearchStyle={masterdataStyles.inputSearchStyle}
                iconStyle={masterdataStyles.iconStyle}
                itemTextStyle={[masterdataStyles.text, masterdataStyles.textDark]}
                data={options}
                search
                // maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={`Select ${title}`}
                searchPlaceholder="Search..."
                value={value as string}
                onChange={handleChange}
                onBlur={handleBlur}
                renderLeftIcon={() => (
                    <IconButton
                        style={masterdataStyles.icon}
                        icon={options.find((v) => v.value === value)?.icon || lefticon || "check-all"}
                        size={20}
                    />
                )}
                renderRightIcon={() => (
                    <View id="customdropdown-single-right-icon" >
                        {value ? (
                            <IconButton
                                style={masterdataStyles.icon}
                                icon="window-close"
                                size={30}
                                onPress={() => {
                                    handleChange("");
                                }}
                            />
                        ) : (
                            <IconButton style={masterdataStyles.icon} icon="chevron-down" size={30} />
                        )}
                        {iconRight ?? false}
                    </View>
                )}
                testID={testId}
            />
            <HelperText type="error" visible={error} style={{ left: -10 }}>
                {errorMessage}
            </HelperText>
        </View>
    );
};


export default React.memo(CustomDropdownSingle);

