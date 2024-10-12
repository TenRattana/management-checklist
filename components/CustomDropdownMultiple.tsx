import React, { useState, useEffect, useCallback } from "react";
import { IconButton, Chip, Text } from "react-native-paper";
import { MultiSelect } from 'react-native-element-dropdown';
import AccessibleView from "@/components/AccessibleView";
import { CustomDropdownMultiProps } from '@/typing/tag';
import { useRes } from "@/app/contexts";
import useMasterdataStyles from "@/styles/common/masterdata";

const CustomDropdownMultiple = ({ labels, values, title, data, value, handleChange, lefticon, iconRight, testId, handleBlur }: CustomDropdownMultiProps) => {
  const [options, setOptions] = useState<{ label?: string; value?: string; icon?: () => JSX.Element }[]>([]);

  console.log("Value", value);

  const masterdataStyles = useMasterdataStyles();

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

  return (
    <AccessibleView name="customdropdown-multi" style={masterdataStyles.containerInput}>
      <MultiSelect
        style={masterdataStyles.dropdown}
        placeholderStyle={masterdataStyles.placeholderStyle}
        selectedTextStyle={masterdataStyles.selectedTextStyle}
        inputSearchStyle={masterdataStyles.inputSearchStyle}
        iconStyle={masterdataStyles.iconStyle}
        data={options}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={`Select ${title}`}
        searchPlaceholder="Search..."
        value={value as string[]}
        onChange={handleChange}
        onBlur={handleBlur}
        renderLeftIcon={() => (
          <IconButton
            style={masterdataStyles.icon}
            icon={options.find((v) => v.value === value)?.icon || lefticon || "check-all"}
            size={20}
          />
        )}
        renderRightIcon={() => (
          <AccessibleView name="customdropdown-single-right-icon" style={{ flexDirection: "row" }}>
            {Array.isArray(value) && value.length > 0 ? (
              <IconButton
                style={masterdataStyles.icon}
                icon="window-close"
                size={30}
                onPress={() => {
                  handleChange([]);
                }}
              />
            ) : (
              <IconButton style={masterdataStyles.icon} icon="chevron-down" size={30} />
            )}
            {iconRight ?? false}
          </AccessibleView>
        )}
        renderSelectedItem={(item, unSelect) => (
          <AccessibleView name="chip-mul" style={masterdataStyles.chipContainer}>
            <Chip
              style={masterdataStyles.chip}
              mode="outlined"
              onClose={() => unSelect?.(item)}
            >
              <IconButton
                icon="delete"
                size={spacing.small}
                onPress={() => unSelect?.(item)}
                style={{ padding: 0 }}
              />
              <Text style={[masterdataStyles.text, masterdataStyles.textDark]}>{item.label}</Text>
            </Chip>
          </AccessibleView>
        )}
        testID={testId}
      />
    </AccessibleView>
  );
};

export default React.memo(CustomDropdownMultiple);
