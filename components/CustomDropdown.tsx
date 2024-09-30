import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { Chip } from "react-native-paper";
import AccessibleView from "@/components/AccessibleView";

interface CustomDropdownSingleProps {
    labels: string;
    values: string;
    title: string;
    data: Array<{ [key: string]: any }>;
    selectedValue?: string;
    onValueChange: (value?: string) => void;
    lefticon?: string;
}

const CustomDropdownSingle: React.FC<CustomDropdownSingleProps> = ({
    labels,
    values,
    title,
    data,
    selectedValue = "",
    onValueChange,
    lefticon
}) => {
    const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
    const [currentValue, setCurrentValue] = useState<string | null>(selectedValue || null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<{ label: string; value: string }[]>([]);

    const processData = useCallback(() => {
        if (data && Array.isArray(data)) {
            return data.map((item) => ({
                label: item[labels] || "",
                value: item[values] || "",
            }));
        }
        return [];
    }, [data, labels, values]);

    useEffect(() => {
        const newOptions = processData();
        setOptions(newOptions);
        setItems(newOptions);
    }, [processData]); 

    useEffect(() => {
        setCurrentValue(selectedValue || null);
    }, [selectedValue]);

    const handleValueChange = useCallback(() => {
        onValueChange(currentValue || "");
    }, []);

    const styles = StyleSheet.create({
        container: {
            marginVertical: 10,
            paddingHorizontal: 16,
            zIndex: 1,
        },
        dropdown: {
            height: 50,
            borderColor: "gray",
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: "#fff",
        },
        item: {
            marginTop: 10,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
        },
        chip: {
            marginRight: 5,
            marginBottom: 5,
        },
    });

    return (
        <AccessibleView style={styles.container}>
            <DropDownPicker
                open={open}
                value={currentValue}
                items={items}
                setOpen={setOpen}
                setValue={setCurrentValue} 
                setItems={setItems} 
                // onChangeValue={onValueChange}
                theme="DARK"
                mode="BADGE"
                badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#8ac926"]}
            />
        </AccessibleView>
    );
};

export default CustomDropdownSingle;
