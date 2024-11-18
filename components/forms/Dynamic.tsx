import React, { useEffect, useMemo, useState } from "react";
import { Selects, Radios, Textareas, Inputs, Checkboxs } from "@/components/common";
import { CheckListOption } from '@/typing/type';
import { DynamicFormProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import { View } from "react-native";
import { useRes, useTheme } from "@/app/contexts";
import { HelperText, Text } from "react-native-paper";

const DynamicForm = React.memo(({
  field,
  values,
  handleChange,
  handleBlur,
  groupCheckListOption,
  error,
  errorMessages,
  type,
  warning,
  exp
}: DynamicFormProps) => {
  const { CTypeName, CListName, MCListID, GCLOptionID, Required, Important, ImportantList } = field;
  const masterdataStyles = useMasterdataStyles();
  const { theme } = useTheme()
  const { fontSize } = useRes()

  const [textColor, setTextColor] = useState(theme.colors.onBackground);
  const [minOrmax, setMinOrMax] = useState(false);
  const [messageminOrmax, setMessageMinOrMax] = useState("");

  useEffect(() => {
    if (Important) {
      const numericValue = Number(values);

      const minLength = Number(ImportantList?.[0]?.MinLength) || 0;
      const maxLength = Number(ImportantList?.[0]?.MaxLength) || Infinity;

      if (numericValue < minLength) {
        setTextColor(theme.colors.yellow);
        setMinOrMax(true);
        setMessageMinOrMax("Min value control is overlength");
      }
      else if (numericValue > maxLength) {
        setTextColor(theme.colors.error);
        setMinOrMax(true);
        setMessageMinOrMax("Max value control is overlength");
      }
      else {
        setTextColor(theme.colors.onBackground);
        setMinOrMax(false);
        setMessageMinOrMax("");
      }
    }
  }, [Important, values, ImportantList, theme.colors]);

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
            hint={error ? errorMessages?.[MCListID] as string || "" : warning ? warning?.[MCListID] : ""}
            mode={"outlined"}
            label={CListName}
            value={values}
            handleChange={(v) => handleChange(MCListID, v)}
            handleBlur={handleBlur}
            testId={`input-${MCListID}`}
            textColor={textColor}
            exp={exp}
          />
        );
      case "Textarea":
        return (
          <Textareas
            hint={error ? errorMessages?.[MCListID] as string || "" : warning?.[MCListID] ? warning?.[MCListID] : ""}
            mode={"outlined"}
            label={CListName}
            value={values}
            handleChange={(v) => handleChange(MCListID, v)}
            handleBlur={handleBlur}
            testId={`inputarea-${MCListID}`}
            textColor={textColor}
            exp={exp}
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
            exp={exp}
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
            exp={exp}
          />
        );
      case "Checkbox":
        return (
          <Checkboxs
            option={option}
            hint={error ? errorMessages?.[MCListID] as string || "" : ""}
            handleChange={(value: string | string[]) => {
              const processedValues = Array.isArray(value)
                ? value.filter((v: string) => v.trim() !== '')
                : value.split(',').filter((v: string) => v.trim() !== '');

              handleChange(MCListID, processedValues)
            }}
            handleBlur={handleBlur}
            value={values}
            testId={`checkbox-${MCListID}`}
            exp={exp}
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
        style={[masterdataStyles.text, CTypeName === "Text" ? { justifyContent: 'flex-start', alignItems: 'center', marginVertical: fontSize === "large" ? 10 : 5, paddingHorizontal: 20 } : {}, { paddingTop: fontSize === "large" ? 15 : 5 }]}
      >
        {CListName} {" "}
        {Required && <Text style={{ color: theme.colors.error }}>(*)</Text>}
      </Text>
      {renderField()}
      <HelperText type="info" visible={minOrmax} style={[{ display: minOrmax ? 'flex' : 'none', color: textColor }, masterdataStyles.errorText]}>
        {messageminOrmax}
      </HelperText>
    </View>
  );
});

export default DynamicForm;
