import React, { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import { IconButton, HelperText } from "react-native-paper";
import { Dropdown } from 'react-native-element-dropdown';
import { CustomDropdownSingleProps } from '@/typing/tag'
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts/useRes";

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
    const { spacing } = useRes();
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
                mode="modal"
                style={masterdataStyles.dropdown}
                placeholderStyle={masterdataStyles.placeholderStyle}
                selectedTextStyle={masterdataStyles.selectedTextStyle}
                inputSearchStyle={masterdataStyles.inputSearchStyle}
                iconStyle={masterdataStyles.iconStyle}
                itemTextStyle={masterdataStyles.text}
                activeColor={masterdataStyles.backMain.backgroundColor}
                containerStyle={[masterdataStyles.backLight]}
                searchPlaceholderTextColor={masterdataStyles.text.color}
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
                        size={spacing.large}
                    />
                )}
                renderRightIcon={() => (
                    <View id="customdropdown-single-right-icon" >
                        {value ? (
                            <IconButton
                                style={masterdataStyles.icon}
                                icon="window-close"
                                size={spacing.large}
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
            <HelperText type="error" visible={error} style={[{ display: error ? 'flex' : 'none' }, masterdataStyles.errorText]}>
                {errorMessage}
            </HelperText>
        </View>
    );
};


export default React.memo(CustomDropdownSingle);

