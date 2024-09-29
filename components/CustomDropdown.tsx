import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { IconButton } from "react-native-paper";

interface CustomDropdownProps {
    title?: string;
    labels: string;
    values: string;
    data?: { [key: string]: any }[];
    selectedValue?: string;
    onValueChange: (value: string, icon?: string) => void;
    optionStyle?: any;
    lefticon?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    title,
    labels,
    values,
    data = [],
    selectedValue = "",
    onValueChange,
    optionStyle,
    lefticon,
}) => {
    const [options, setOptions] = useState<{ label: string; value: string; icon?: () => JSX.Element }[]>([]);
    const [open, setOpen] = useState(false);
    const [currentValue, setCurrentValue] = useState<string | null>(null);

    useEffect(() => {
        if (data && Array.isArray(data)) {
            setOptions(
                data.map((item) => ({
                    label: item[labels] || "",
                    value: item[values] || "",
                    icon: item.icon
                        ? () => (
                            <IconButton
                                icon={item.icon || "check-all"}
                                size={20}
                            />
                        )
                        : undefined,
                }))
            );
        }
    }, [data, labels, values]);

    useEffect(() => {
        setCurrentValue(selectedValue);
    }, [selectedValue]);

    const styles = StyleSheet.create({
        dropdown: {
            margin: 10,
            borderColor: "gray",
            borderWidth: 0.5,
        },
        item: {
            padding: 17,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
        },
    });

    return (
        <View>
            <DropDownPicker
                open={open}
                value={currentValue}
                items={options}
                setOpen={setOpen}
                setValue={setCurrentValue}
                setItems={setOptions}
                placeholder={`Select ${title}`}
                searchPlaceholder={`Search ${title}...`}
                searchable={true}
                listMode="MODAL"
                style={styles.dropdown}
                dropDownContainerStyle={{ maxHeight: 300 }}
                onChangeValue={(newValue) => {
                    const selectedIcon = options.find((v) => v.value === newValue)?.icon;
                    setCurrentValue(newValue);
                    onValueChange(newValue ?? "", selectedIcon ? selectedIcon().props.icon : undefined);
                }}
                renderListItem={(props) => (
                    <View style={styles.item}>
                        {props.item.icon && props.item.icon()}
                        <Text>{props.item.label}</Text>
                    </View>
                )}
                ArrowDownIconComponent={() => (
                    <IconButton
                        icon="chevron-down"
                        size={20}
                    />
                )}
                ArrowUpIconComponent={() => (
                    <IconButton
                        icon="chevron-up"
                        size={20}
                    />
                )}
                CloseIconComponent={() => (
                    <IconButton
                        icon="window-close"
                        size={20}
                        onPress={() => {
                            setCurrentValue(null);
                            onValueChange("");
                        }}
                    />
                )}
            />
        </View>
    );
};

export default CustomDropdown;
