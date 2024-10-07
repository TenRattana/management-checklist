import React, { useState, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import AccessibleView from "@/components/AccessibleView";
import { CustomDropdownMultiProps } from '@/typing/tag';

const CustomDropdownMulti = ({
  labels,
  values,
  data,
  selectedValue = [],
  onValueChange,
}: CustomDropdownMultiProps) => {
  const [currentValue, setCurrentValue] = useState<string[]>(selectedValue);
  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
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
    if (selectedValue.length !== currentValue.length || !selectedValue.every(val => currentValue.includes(val))) {
      setCurrentValue(selectedValue);
    }
  }, [selectedValue]);

  const handleSelect = (value: string[]) => {
    setCurrentValue(value);
    onValueChange(value);
  };

  const styles = StyleSheet.create({
    dropdownContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
      zIndex: 1
    },
    dropdown: {
      flex: 1,
      height: 50,
      borderBottomColor: '#6200ee',
      borderBottomWidth: 1,
      marginRight: 10,
    },
    dropdownText: {
      fontSize: 18,
      color: '#000',
    },
    placeholderText: {
      fontSize: 18,
      color: '#999',
    },
    button: {
      backgroundColor: '#6200ee',
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
  });

  return (
    <AccessibleView style={styles.dropdownContainer}>
      <DropDownPicker
        open={open}
        value={currentValue}
        items={options}
        setOpen={setOpen}
        // setValue={(values: string[]) => handleSelect(values)}
        setItems={setCurrentValue}
        multiple={true}
        placeholder="Choose fruits"
        multipleText="have been selected."
        style={styles.dropdown}
        dropDownContainerStyle={{ borderColor: 'transparent' }}
        textStyle={styles.dropdownText}
        placeholderStyle={styles.placeholderText}
        zIndex={1000}
        zIndexInverse={1000}
      />
      <Pressable style={styles.button} onPress={() => onValueChange(currentValue)}>
        <Text style={styles.buttonText}>Done</Text>
      </Pressable>
    </AccessibleView>
  );
};

export default React.memo(CustomDropdownMulti);
