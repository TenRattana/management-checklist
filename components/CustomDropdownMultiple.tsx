import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import AccessibleView from "@/components/AccessibleView";
import { CustomDropdownMultiProps } from '@/typing/tag';
import { IconButton, Chip } from "react-native-paper";

const CustomDropdownMulti = ({
  labels,
  values,
  data,
  selectedValue = [],
  onValueChange,
  iconRight,
  lefticon,
}: CustomDropdownMultiProps) => {
  const [options, setOptions] = useState<{ label?: string; value?: string; icon?: () => JSX.Element }[]>([]);
  const [currentValue, setCurrentValue] = useState<string[]>(Array.isArray(selectedValue) ? selectedValue : []);
  const [open, setOpen] = useState(false);

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
    if (selectedValue.length !== currentValue.length || !selectedValue.every(val => currentValue.includes(val))) {
      setCurrentValue(Array.isArray(selectedValue) ? selectedValue : []);
    }
  }, [selectedValue]);

  const handleSelect = (value: string[]) => {
    setCurrentValue(value);
    onValueChange(value);
  };

  const handleChipClose = (chipToRemove: string) => {
    const newValue = currentValue.filter(value => value !== chipToRemove);
    setCurrentValue(newValue);
    onValueChange(newValue);
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
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 5,
    },
    chip: {
      marginRight: 5,
      marginBottom: 5,
    },
  });

  return (
    <AccessibleView style={styles.dropdown}>
      <Dropdown
        style={styles.dropdown}
        data={options}
        labelField="label"
        valueField="value"
        value={currentValue}
        placeholder="Choose options"
        multiple={true}
        onChange={handleSelect}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
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
            {iconRight ?? false}
          </AccessibleView>
        )}
      />

      <View style={styles.chipContainer}>
        {(Array.isArray(currentValue) ? currentValue : []).map((chip) => (
          <Chip
            key={chip}
            style={styles.chip}
            onClose={() => handleChipClose(chip)}
          >
            {options.find(option => option.value === chip)?.label || chip}
          </Chip>
        ))}
      </View>
    </AccessibleView>
  );
};

export default React.memo(CustomDropdownMulti);
