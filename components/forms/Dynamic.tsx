import React from "react";
import { View, Text } from "react-native";
import { Selects, Radios, Checkboxs, Textareas, Inputs } from "@/components/common";


interface Field {
  CheckListTypeName: string;
  placeholder?: string;
  hint?: string;
  CheckListName: string;
  checkListId: string;
  groupCheckListOptionId?: number;
}

interface Option {
  label: string;
  value: string;
}


interface CheckListOption {
  CLOptionID: string;
  CLOptionName: string;
}

interface GroupCheckListOption {
  GCLOptionID: number;
  CheckListOptions: CheckListOption[];
}

interface DynamicFormProps {
  fields: Field[];
  checkListType?: string;
  style: any;
  checkList: any;
  values: { [key: string]: any };
  handleChange: (field: string, value?: any) => void;
  handleBlur: (field: string) => void;
  touched: { [key: string]: boolean };
  errors: { [key: string]: string };
  indexSubForm: string;
  groupCheckListOption: GroupCheckListOption[];
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  checkListType,
  style,
  checkList,
  values,
  handleChange,
  handleBlur,
  touched,
  errors,
  indexSubForm,
  groupCheckListOption,
}) => {
  const { styles, colors } = style;

  const renderField = (field: Field, index: number) => {
    const option: Option[] = groupCheckListOption
      .find((option) => option.GCLOptionID === field.groupCheckListOptionId)
      ?.CheckListOptions.map((item) => ({
        label: item.CLOptionName,
        value: item.CLOptionID,
      })) || [];

    switch (field.CheckListTypeName) {
      case "Textinput":
        return (
          <Inputs
            placeholder={field.placeholder}
            hint={field.hint}
            label={field.CheckListName}
            value={values.matchCheckListId || `${indexSubForm}-${index}`}
            handleChange={() => handleChange("matchCheckListId")}
            handleBlur={() => handleBlur("matchCheckListId")}
            error={touched.matchCheckListId && Boolean(errors.matchCheckListId)}
            errorMessage={
              touched.matchCheckListId ? errors.matchCheckListId : ""
            }
          />
        );
      case "Textarea":
        return (
          <Textareas
            placeholder={field.placeholder}
            hint={field.hint}
            label={field.CheckListName}
            value={values.matchCheckListId || `${indexSubForm}-${index}`}
            handleChange={() => handleChange("matchCheckListId")}
            handleBlur={() => handleBlur("matchCheckListId")}
            error={touched.matchCheckListId && Boolean(errors.matchCheckListId)}
            errorMessage={
              touched.matchCheckListId ? errors.matchCheckListId : ""
            }
          />
        );
      case "Radio":
        return (
          <Radios
            option={option}
            hint={field.hint}
            handleChange={(v) => handleChange("matchCheckListId", v)}
            value={values.matchCheckListId || `${indexSubForm}-${index}`}
            handleBlur={() => handleBlur("matchCheckListId")}
            error={touched.matchCheckListId && Boolean(errors.matchCheckListId)}
            errorMessage={
              touched.matchCheckListId ? errors.matchCheckListId : ""
            }
          />
        );
      case "Dropdown":
        return (
          <Selects
            option={option}
            hint={field.hint}
            handleChange={(v) => handleChange("matchCheckListId", v)}
            value={values.matchCheckListId || `${indexSubForm}-${index}`}
            handleBlur={() => handleBlur("matchCheckListId")}
            error={touched.matchCheckListId && Boolean(errors.matchCheckListId)}
            errorMessage={
              touched.matchCheckListId ? errors.matchCheckListId : ""
            }
          />
        );
      case "Checkbox":
        return (
          <Checkboxs
            option={option}
            hint={field.hint}
            handleChange={(v) => handleChange("matchCheckListId", v)}
            value={values.matchCheckListId || `${indexSubForm}-${index}`}
            handleBlur={() => handleBlur("matchCheckListId")}
            error={touched.matchCheckListId && Boolean(errors.matchCheckListId)}
            errorMessage={
              touched.matchCheckListId ? errors.matchCheckListId : ""
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <View>
      {fields.map((field, index) => (
        <View key={field.checkListId} style={styles.section}>
          <Text style={[styles.text, { color: colors.palette.dark }]}>
            {field.CheckListName}
          </Text>
          {renderField(field, index)}
        </View>
      ))}
    </View>
  );
};

export default DynamicForm;
