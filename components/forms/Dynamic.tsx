import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Selects, Radios, Textareas, Inputs, Checkboxs } from "@/components/common";
import { DynamicFormProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import { Text } from "react-native-paper";
import useField from "@/hooks/FieldDialog";
import Time from "../common/Time";

const DynamicForm = React.memo(({
  field,
  values,
  handleChange,
  handleBlur,
  error,
  errorMessages,
  type,
  exp,
  showField,
  number
}: DynamicFormProps) => {
  const { CTypeName, CListName, MCListID, GCLOptionID, Required, Important, ImportantList, SFormID } = field;
  const masterdataStyles = useMasterdataStyles();
  const { theme } = useTheme();
  const { fontSize } = useRes();
  const { groupCheckListOption } = useField();

  const [textColor, setTextColor] = useState(theme.colors.onBackground);
  const [messageminOrmax, setMessageMinOrMax] = useState("");

  useEffect(() => {
    if (Important && type === "Number" && values !== "") {
      const numericValue = Number(values);

      const minLength = Number(ImportantList?.[0]?.MinLength) || 0;
      const maxLength = Number(ImportantList?.[0]?.MaxLength) || Infinity;

      if (numericValue <= minLength) {
        setTextColor(theme.colors.yellow);
        setMessageMinOrMax("Min value control is overlength");
      }
      else if (numericValue >= maxLength) {
        setTextColor(theme.colors.error);
        setMessageMinOrMax("Max value control is overlength");
      }
      else {
        setTextColor(theme.colors.onBackground);
        setMessageMinOrMax("");
      }
    }
  }, [Important, values, ImportantList, theme.colors]);

  const option = useMemo(() =>
    groupCheckListOption
      .filter(option => option.GCLOptionID === GCLOptionID)
      .flatMap(option => option.CheckListOptions?.filter(item => item.IsActive)
        .map(item => ({
          label: item.CLOptionName,
          value: item.CLOptionID,
        })) || []),
    [groupCheckListOption, GCLOptionID]
  );

  const renderField = useCallback(() => {
    switch (CTypeName) {
      case "Textinput":
        return (
          <Inputs
            hint={error ? errorMessages?.[MCListID] as string || "" : messageminOrmax ? messageminOrmax : ""}
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
      case "Time":
        return (
          <Time
            hint={error ? errorMessages?.[MCListID] as string : ""}
            label={CListName}
            value={values}
            handleChange={(v: any) => handleChange(MCListID, v)}
            handleBlur={handleBlur}
            testId={`time-${MCListID}`}
            exp={exp}
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
            handleChange={(value) => {
              const processedValues = Array.isArray(value)
                ? value.filter((v: string) => v.trim() !== '')
                : String(value).split(',').filter((v: string) => v.trim() !== '');
              handleChange(MCListID, processedValues);
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
  }, [CTypeName, CListName, MCListID, values, handleChange, handleBlur, textColor, errorMessages, exp, option]);

  const styles = StyleSheet.create({
    text: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginVertical: fontSize === "large" ? 10 : 5,
      paddingHorizontal: 20,
      paddingTop: fontSize === "large" ? 15 : 5
    }
  });


  const isValidImportantList = useMemo(() => {
    return values && ImportantList && ImportantList.length > 0 ? ImportantList?.every(
      (value) => value.Value && value.Value?.includes(values)
    ) : values && Important ? Important : false;
  }, [values, Important, ImportantList]);

  return (
    <View id="form-layout2">
      <TouchableOpacity onPress={() => showField && showField(String(MCListID), String(SFormID))}>
        <Text
          variant="bodyMedium"
          style={[masterdataStyles.text, masterdataStyles.textBold, CTypeName === "Text" ? styles.text : undefined, { color: exp && (messageminOrmax || isValidImportantList) ? theme.colors.error : theme.colors.onBackground }]}>
          {number}{" "}
          {Required && <Text style={{ color: theme.colors.error }}>(*)</Text>}
        </Text>
        {renderField()}
      </TouchableOpacity>
    </View>
  );
});

export default DynamicForm;
