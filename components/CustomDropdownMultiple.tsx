import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import { IconButton, Chip, Text } from "react-native-paper";
import { MultiSelect } from 'react-native-element-dropdown';
import AccessibleView from "@/components/AccessibleView";
import { CustomDropdownMultiProps } from '@/typing/tag';
import { useRes } from "@/app/contexts";

const CustomDropdownMultiple = ({ labels, values, title, data, selectedValue, onValueChange, lefticon, iconRight, testId }: CustomDropdownMultiProps) => {
  const [options, setOptions] = useState<{ label?: string; value?: string; icon?: () => JSX.Element }[]>([]);
  const [currentValue, setCurrentValue] = useState<string[]>(Array.isArray(selectedValue) ? selectedValue : []);
  const { spacing } = useRes();
  console.log("CustomDropdownMultiple");

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

  useEffect(() => {
    setCurrentValue(Array.isArray(selectedValue) ? selectedValue : []);
  }, [selectedValue]);

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
    placeholderStyle: {
      fontSize: spacing.medium,
    },
    selectedTextStyle: {
      fontSize: spacing.medium,
    },
    iconStyle: {
      width: 20,
    },
    inputSearchStyle: {
      fontSize: spacing.medium,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 5,
    },
    chip: {
      marginRight: 5,
      marginBottom: 5,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
    },
    chipText: {
      fontSize: spacing.medium,
      marginLeft: 5,
    },
  });

  return (
    <AccessibleView name="customdropdown-multi">
      <MultiSelect
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
          setCurrentValue(newValue);
          onValueChange(newValue);
        }}
        renderLeftIcon={() => (
          <IconButton
            style={styles.icon}
            icon={lefticon || "check-all"}
            size={spacing.medium}
          />
        )}
        renderRightIcon={() => (
          <AccessibleView name="customdropdown-multi-right-icon" style={{ flexDirection: "row" }}>
            {currentValue.length > 0 ? (
              <IconButton
                style={styles.icon}
                icon="window-close"
                size={spacing.medium}
                onPress={() => {
                  setCurrentValue([]);
                  onValueChange([]);
                }}
              />
            ) : (
              <IconButton
                style={styles.icon}
                icon="chevron-down"
                size={spacing.medium}
              />
            )}
            {iconRight ?? null}
          </AccessibleView>
        )}
        renderSelectedItem={(item) => (
          <Chip
            style={styles.chip}
            mode="outlined"
            onClose={() => handleChipClose(item.value ?? "")}
          >
            <IconButton
              icon="delete"
              size={spacing.medium}
              onPress={() => handleChipClose(item.value ?? "")}
              style={{ padding: 0 }}
            />
            <Text style={styles.chipText}>{item.label}</Text>
          </Chip>
        )}
        testID={testId}
      />
    </AccessibleView>
  );
};

export default React.memo(CustomDropdownMultiple);
