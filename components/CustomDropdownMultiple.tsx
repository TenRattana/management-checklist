import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import { IconButton, Chip } from "react-native-paper";
import { MultiSelect, IMultiSelectRef } from 'react-native-element-dropdown';
import AccessibleView from "@/components/AccessibleView";
import { CustomDropdownMultiProps } from '@/typing/tag';

const CustomDropdownMulti = forwardRef<IMultiSelectRef, CustomDropdownMultiProps>(({
  labels,
  values,
  data,
  selectedValue = [],
  onValueChange,
  testId
}, ref) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [currentValue, setCurrentValue] = useState<string[]>(selectedValue);
  const multiSelectRef = useRef<IMultiSelectRef>(null); 

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
    setCurrentValue(prevValues => 
      prevValues.filter(value => newOptions.some(option => option.value === value))
    );
  }, [processData]);

  useEffect(() => {
    setCurrentValue(selectedValue);
  }, [selectedValue]);

  useImperativeHandle(ref, () => ({
    getSelectedValues: () => currentValue, 
    open: () => multiSelectRef.current?.open(),
    close: () => multiSelectRef.current?.close(),
  }));

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
        ref={multiSelectRef} // Attach the local ref here
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
        }}
        renderRightIcon={() => (
          <AccessibleView>
            {currentValue.length > 0 ? (
              <IconButton
                style={styles.icon}
                icon="window-close"
                size={30}
                onPress={() => {
                  setCurrentValue([]);
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
        testID={testId}
      />
    </AccessibleView>
  );
});

export default React.memo(CustomDropdownMulti);
