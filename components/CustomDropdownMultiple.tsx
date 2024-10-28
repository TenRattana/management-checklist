import React, { useState, useEffect, useCallback } from "react";
import { IconButton } from "react-native-paper";
import { MultiSelect } from 'react-native-element-dropdown';
import AccessibleView from "@/components/AccessibleView";
import { CustomDropdownMultiProps } from '@/typing/tag';
import { useRes } from "@/app/contexts";
import useMasterdataStyles from "@/styles/common/masterdata";
import { Pressable, View } from "react-native";
import Text from "@/components/Text";

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
    <View id="customdropdown-multi" style={masterdataStyles.commonContainer}>
      <MultiSelect
        mode="modal"
        style={masterdataStyles.dropdown}
        placeholderStyle={masterdataStyles.placeholderStyle}
        selectedTextStyle={masterdataStyles.selectedTextStyle}
        inputSearchStyle={masterdataStyles.inputSearchStyle}
        iconStyle={masterdataStyles.iconStyle}
        itemTextStyle={masterdataStyles.text}
        containerStyle={masterdataStyles.backLight}
        data={options}
        search
        // maxHeight={500}
        labelField="label"
        valueField="value"
        placeholder={`Select ${title}`}
        searchPlaceholder="Search..."
        value={value as string[]}
        onChange={handleChange}
        onBlur={handleBlur}
        activeColor={masterdataStyles.backMain.backgroundColor}
        alwaysRenderSelectedItem
        showsVerticalScrollIndicator
        renderLeftIcon={() => (
          <IconButton
            style={masterdataStyles.icon}
            icon={options.find((v) => v.value === value)?.icon || lefticon || "check-all"}
            size={20}
          />
        )}
        renderRightIcon={() => (
          <View id="customdropdown-single-right-icon">
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
          </View>
        )}
        renderSelectedItem={(item, unSelect) => (
          <Pressable onPress={() => unSelect && unSelect(item)}>
            <AccessibleView name="container-renderSelect" style={masterdataStyles.selectedStyle}>
              <Text style={[masterdataStyles.text, masterdataStyles.textDark]}>{item.label}</Text>
              {/* <AntDesign style={styles.icon} name="Safety" size={20} /> */}
            </AccessibleView>
          </Pressable>
        )}
        testID={testId}
      />
    </View>
  );
};

export default React.memo(CustomDropdownMultiple);
