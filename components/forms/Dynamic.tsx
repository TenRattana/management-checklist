import React, { useMemo } from "react";
import { Selects, Radios, Textareas, Inputs, Checkboxs } from "@/components/common";
import { CheckListOption } from '@/typing/type';
import AccessibleView from "../AccessibleView";
import { DynamicFormProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import { View } from "react-native";
import { useTheme } from "@/app/contexts";
import { Text } from "react-native-paper";

const DynamicForm = React.memo(({
  field,
  values,
  handleChange,
  handleBlur,
  groupCheckListOption,
  error,
  errorMessages
}: DynamicFormProps) => {
  const { CTypeName, Hint, CListName, MCListID, GCLOptionID, Required } = field;
  const masterdataStyles = useMasterdataStyles();
  const { theme } = useTheme()

  const option = useMemo(() =>
    groupCheckListOption
      .filter(option => option.GCLOptionID === GCLOptionID)
      .flatMap(v => v.CheckListOptions?.map((item: CheckListOption) => ({
        label: item.CLOptionName,
        value: item.CLOptionID,
      })) || []),
    [groupCheckListOption, GCLOptionID]
  );

  const renderField = () => {
    switch (CTypeName) {
      case "Textinput":
        return (
          <Inputs
            hint={error ? errorMessages?.[MCListID] as string || "" : ""}
            mode={"outlined"}
            label={CListName}
            value={values}
            handleChange={(v) => handleChange(MCListID, v)}
            handleBlur={handleBlur}
            testId={`input-${MCListID}`}
          />
        );
      case "Textarea":
        return (
          <Textareas
            hint={error ? errorMessages?.[MCListID] as string || "" : ""}
            mode={"outlined"}
            label={CListName}
            value={values}
            handleChange={(v) => handleChange(MCListID, v)}
            handleBlur={handleBlur}
            testId={`inputarea-${MCListID}`}
          />
        );
      case "Radio":
        return (
          <Radios
            option={option}
            hint={error ? errorMessages?.[MCListID] as string || "" : ""}
            handleChange={(v) => handleChange(MCListID, v)}
            handleBlur={handleBlur}
            value={values}
            testId={`radio-${MCListID}`}
          />
        );
      case "Dropdown":
        return (
          <Selects
            option={option}
            hint={error ? errorMessages?.[MCListID] as string || "" : ""}
            handleChange={(v) => handleChange(MCListID, v)}
            handleBlur={handleBlur}
            value={values}
            testId={`dropdown-${MCListID}`}
          />
        );
      case "Checkbox":
        return (
          <Checkboxs
            option={option}
            hint={error ? errorMessages?.[MCListID] as string || "" : ""}
            handleChange={(v) => handleChange(MCListID, v)}
            handleBlur={handleBlur}
            value={values}
            testId={`checkbox-${MCListID}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View id="form-layout2">
      <Text
        variant="bodyMedium"
        style={[masterdataStyles.text, CTypeName === "Text" ? { justifyContent: 'flex-start', alignItems: 'center', marginVertical: 'auto' } : {}]}
      >
        {CListName} {" "}
        {Required && <Text style={{ color: theme.colors.error }}>(*)</Text>}
      </Text>
      {renderField()}
    </View>
  );
});

export default DynamicForm;
