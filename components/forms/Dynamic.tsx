import React, { useMemo } from "react";
import { Selects, Radios, Textareas, Inputs, Checkboxs } from "@/components/common";
import { CheckListOption } from '@/typing/type';
import AccessibleView from "../AccessibleView";
import { DynamicFormProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";

const DynamicForm = React.memo(({
  field,
  values,
  handleChange,
  handleBlur,
  groupCheckListOption,
  error,
  errorMessage
}: DynamicFormProps) => {
  const { CTypeName, Hint, CListName, MCListID, GCLOptionID } = field;
  const masterdataStyles = useMasterdataStyles();

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
            hint={Hint}
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
            hint={Hint}
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
            hint={Hint}
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
            hint={Hint}
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
            hint={Hint}
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
    <AccessibleView name="form-layout2" style={{ flex: 1 }}>
      <Text style={[masterdataStyles.text, CTypeName === "Text" ? { justifyContent: 'flex-start', alignItems: 'center', marginVertical: 'auto' } : {}]}>{CListName}</Text>
      {renderField()}
      {errorMessage && (
        <Text style={[masterdataStyles.text, masterdataStyles.textError]}>{errorMessage}</Text>
      )}
    </AccessibleView>
  );
});

export default DynamicForm;
