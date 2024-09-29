import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Chip } from "react-native-paper";

interface CustomDropdownMultiProps {
  labels: string;
  values: string;
  title: string;
  data: { [key: string]: any }[];
  selectedValue?: string[];
  onValueChange: (value: string[]) => void;
}

const CustomDropdownMulti: React.FC<CustomDropdownMultiProps> = ({
  labels,
  values,
  title,
  data,
  selectedValue = [],
  onValueChange,
}) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [currentValue, setCurrentValue] = useState<string[]>(selectedValue);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setOptions(
        data.map((item) => ({
          label: item[labels] || "",
          value: item[values] || "",
        }))
      );
    }
  }, [data, labels, values]);

  useEffect(() => {
    setCurrentValue(selectedValue);
  }, [selectedValue]);

  const handleValueChange = (value: string) => {
    const newValue = currentValue.includes(value)
      ? currentValue.filter((item) => item !== value)
      : [...currentValue, value];

    setCurrentValue(newValue);
    onValueChange(newValue);
  };

  return (
    <View>
      <DropDownPicker
        multiple
        open={isOpen}
        items={options}
        value={currentValue}
        setItems={setOptions}
        setOpen={setIsOpen}
        setValue={setCurrentValue}
        onChangeValue={(item: any) => handleValueChange(item)}
        placeholder={`Select ${title}`}
        maxHeight={300}
        searchable
        searchPlaceholder="Search..."
      />
      {currentValue.length > 0 && (
        <View>
          {currentValue.map((item) => (
            <Chip
              key={item}
              icon="close"
              onPress={() => handleValueChange(item)}
            >
              {options.find((option) => option.value === item)?.label || item}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );
};

export default CustomDropdownMulti;
