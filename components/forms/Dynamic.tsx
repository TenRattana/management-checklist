import React from "react";
import { Text } from "react-native";
import { Selects, Radios, Textareas, Inputs, Checkboxs } from "@/components/common";
import { CheckListOption } from '@/typing/type';
import AccessibleView from "../AccessibleView";
import { DynamicFormProps } from "@/typing/tag";

const DynamicForm = React.memo(({
  field,
  values,
  setFieldValue,
  groupCheckListOption,
}: DynamicFormProps) => {
  const { CTypeName, Placeholder, Hint, CListName, MCListID, GCLOptionID } = field;

  const option = groupCheckListOption
    .filter(option => option.GCLOptionID === GCLOptionID)
    .flatMap(v =>
      v.CheckListOptions?.map((item: CheckListOption) => ({
        label: item.CLOptionName,
        value: item.CLOptionID,
      })) || []
    );
  console.log("DynamicForm");

  const renderField = () => {
    switch (CTypeName) {
      case "Textinput":
        return (
          <Inputs
            placeholder={Placeholder}
            hint={Hint}
            label={CListName}
            value={values[MCListID] ?? ""}
            handleChange={(v) => setFieldValue(MCListID, v)}
            testId={`input-${MCListID}`}
          />
        );
      case "Textarea":
        return (
          <Textareas
            placeholder={Placeholder}
            hint={Hint}
            label={CListName}
            value={values[MCListID] ?? ""}
            handleChange={(v) => setFieldValue(MCListID, v)}
            testId={`inputarea-${MCListID}`}
          />
        );
      case "Radio":
        return (
          <Radios
            option={option}
            hint={Hint}
            handleChange={(v) => setFieldValue(MCListID, v)}
            value={values[MCListID]}
            testId={`radio-${MCListID}`}
          />
        );
      case "Dropdown":
        return (
          <Selects
            option={option}
            hint={Hint}
            handleChange={(v) => setFieldValue(MCListID, v)}
            value={values[MCListID] ?? ""}
            testId={`dropdown-${MCListID}`}
          />
        );
      case "Checkbox":
        return (
          <Checkboxs
            option={option}
            hint={Hint}
            handleChange={(v) => setFieldValue(MCListID, v)}
            value={values[MCListID] ?? []}
            testId={`checkbox-${MCListID}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AccessibleView name="form-layout2" style={{ flex: 1 }}>
      <Text>{CListName}</Text>
      {renderField()}
    </AccessibleView>
  );
});

export default DynamicForm;
