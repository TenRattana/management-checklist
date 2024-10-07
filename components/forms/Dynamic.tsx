import React from "react";
import { Text, ViewStyle } from "react-native";
import { Selects, Radios, Textareas, Inputs, Checkboxs } from "@/components/common";
import { CheckListOption, GroupCheckListOption } from '@/typing/type';
import { BaseFormState } from '@/typing/form';
import AccessibleView from "../AccessibleView";
import { ScrollView } from "react-native-gesture-handler";

interface DynamicFormProps {
  field: BaseFormState;
  values: any;
  setFieldValue: any;
  groupCheckListOption: GroupCheckListOption[];
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  field,
  values,
  setFieldValue,
  groupCheckListOption,
}) => {
  const option = groupCheckListOption
    .filter(option => option.GCLOptionID === field.GCLOptionID)
    .flatMap(v =>
      v.CheckListOptions?.map((item: CheckListOption) => ({
        label: item.CLOptionName,
        value: item.CLOptionID,
      })) || []
    );

  const fieldName = field.MCListID;

  const renderField = () => {
    switch (field.CTypeName) {
      case "Textinput":
        return (
          <Inputs
            placeholder={field.Placeholder}
            hint={field.Hint}
            label={field.CListName}
            value={values[fieldName] ?? ""}
            handleChange={(v) => setFieldValue(fieldName, v)}
            testId={`input-${fieldName}`}
          />
        );
      case "Textarea":
        return (
          <Textareas
            placeholder={field.Placeholder}
            hint={field.Hint}
            label={field.CListName}
            value={values[fieldName] ?? ""}
            handleChange={(v) => setFieldValue(fieldName, v)}
            testId={`inputarea-${fieldName}`}
          />
        );
      case "Radio":
        return (
          <Radios
            option={option}
            hint={field.Hint}
            handleChange={(v) => setFieldValue(fieldName, v)}
            value={values[fieldName]}
            testId={`radio-${fieldName}`}
          />
        );
      case "Dropdown":
        return (
          <Selects
            option={option}
            hint={field.Hint}
            handleChange={(v) => setFieldValue(fieldName, v)}
            value={values[fieldName] ?? ""}
            testId={`dropdown-${fieldName}`}
          />
        );
      case "Checkbox":
        return (
          <Checkboxs
            option={option}
            hint={field.Hint}
            handleChange={(v) => setFieldValue(fieldName, v)}
            value={values[fieldName] ?? []}
            testId={`checkbox-${fieldName}`}
          />
        )
      default:
        return null;
    }
  };
  console.log(values);

  return (
    <AccessibleView>
      <Text>{field.CListName}</Text>
      {renderField()}
    </AccessibleView>

  );
};

export default DynamicForm;