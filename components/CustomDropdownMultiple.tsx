import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { StyleSheet, Text } from "react-native";
import { IconButton } from "react-native-paper";
import { MultiSelect } from 'react-native-element-dropdown';
import AccessibleView from "@/components/AccessibleView";
import { Chip } from "react-native-paper";

interface CustomDropdownMultiProps {
  labels: string;
  values: string;
  title: string;
  data: { [key: string]: any }[];
  selectedValue?: string[];
  onValueChange: (value: string[], icon?: () => JSX.Element) => void;
  lefticon?: string;
}

const CustomDropdownMulti = forwardRef<HTMLDivElement, CustomDropdownMultiProps>(({
  labels,
  values,
  title,
  data,
  selectedValue = [],
  onValueChange,
  lefticon
}, ref) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [currentValue, setCurrentValue] = useState<string[]>(selectedValue);
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
      setCurrentValue([]);
    }
  }, [processData]);

  useEffect(() => {
    setCurrentValue(selectedValue || []);
  }, [selectedValue]);

  const renderItem = item => {
    return (
      <AccessibleView>
        <Text>{item.label}</Text>
      </AccessibleView>
    );
  };

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

  return (
    <AccessibleView>
      <MultiSelect
        ref={ref} // แนบ ref ที่นี่
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={options}
        labelField="label"
        valueField="value"
        placeholder="Select item"
        value={currentValue}
        search
        searchPlaceholder="Search..."
        onChange={item => {
          setCurrentValue(item);
          // onValueChange(item); // อย่าลืมเรียก onValueChange
        }}
        confirmSelectItem
        confirmUnSelectItem
        renderRightIcon={() => (
          <AccessibleView>
            {currentValue.length > 0 ? (
              <IconButton
                style={styles.icon}
                icon="window-close"
                size={30}
                onPress={() => {
                  setCurrentValue([]);
                  onValueChange([]);
                }}
              />
            ) : (
              <IconButton
                style={styles.icon}
                icon="chevron-down"
                size={30}
              />
            )}
          </AccessibleView>
        )}
        renderSelectedItem={(item, unSelect) => (
          <Chip onPress={() => unSelect && unSelect(item)} icon="close">
            {item.label}
          </Chip>
        )}
      />
    </AccessibleView>
  );
});

export default CustomDropdownMulti;
