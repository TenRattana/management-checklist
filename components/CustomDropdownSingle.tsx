import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { Dropdown } from 'react-native-element-dropdown';
import AccessibleView from "@/components/AccessibleView";

interface CustomDropdownSingleProps {
    labels: string;
    values: string;
    title: string;
    data: Array<{ [key: string]: any }>;
    selectedValue?: string;
    onValueChange: (value?: string, icon?: () => JSX.Element) => void;
    lefticon?: string,
    iconRight?: React.ReactNode
}

const CustomDropdownSingle: React.FC<CustomDropdownSingleProps> = ({
    labels,
    values,
    title,
    data,
    selectedValue = "",
    onValueChange,
    lefticon,
    iconRight
}) => {
    const [options, setOptions] = useState<{ label?: string; value?: string; icon?: () => JSX.Element }[]>([]);
    const [currentValue, setCurrentValue] = useState<string | null>(selectedValue || null);
    const [open, setOpen] = useState<boolean>(false);

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
        if (!newOptions.find(option => option.value === currentValue)) {
            setCurrentValue(null);
        }
    }, [processData]);

    useEffect(() => {
        setCurrentValue(selectedValue || null);
    }, [selectedValue]);

    const styles = StyleSheet.create({
        dropdown: {
            height: 50,
            borderBottomColor: 'gray',
            borderBottomWidth: 0.5,
        },
        icon: {
            marginRight: 5,
        },
        placeholderStyle: {
            fontSize: 20,
        },
        selectedTextStyle: {
            fontSize: 20,
        },
        iconStyle: {
            width: 20,
            height: 20,
        },
        inputSearchStyle: {
            height: 40,
            fontSize: 20,
        },
    });

    console.log(currentValue);

    return (
        <AccessibleView>
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={options}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={`Select ${title}`}
                searchPlaceholder="Search..."
                value={currentValue}
                onChange={newValue => {
                    if (newValue) {
                        setCurrentValue(newValue.value || null);
                        onValueChange(
                            newValue.value,
                            options.find((v) => v.value === currentValue)?.icon
                        );
                    }
                }}
                renderLeftIcon={() => (
                    <IconButton
                        style={styles.icon}
                        icon={
                            options.find((v) => v.value === currentValue)?.icon ||
                            lefticon ||
                            "check-all"
                        }
                        size={20}
                    />
                )}
                renderRightIcon={() => (
                    <AccessibleView style={{ flexDirection: "row" }}>
                        {currentValue !== null ? (
                            <IconButton
                                style={styles.icon}
                                icon="window-close"
                                size={30}
                                onPress={() => {
                                    setCurrentValue("");
                                    onValueChange("");
                                }}
                            />
                        ) : (
                            <IconButton
                                style={styles.icon}
                                icon="chevron-down"
                                size={30}
                            />
                        )}
                        {iconRight ?? false}
                    </AccessibleView>
                )}
            />
        </AccessibleView>
    );
};

export default React.memo(CustomDropdownSingle);

