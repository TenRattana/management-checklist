import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import Selects from "@/components/common/Selects";
import Radios from "@/components/common/Radios";
import Checkboxs from "@/components/common/Checkboxs";
import Textareas from "@/components/common/Textareas";
import Inputs from "@/components/common/Inputs";

interface Option {
    label:string;
    value:string;
}

interface Field {
  CheckListTypeName: string;
  placeholder?: string;
  hint?: string;
  CheckListName: string;
  matchCheckListId: string;
  groupCheckListOptionId?: number;
  expectedResult?: string;
  displayOrder?: number;
}

interface SubForm {
  subFormName: string;
  fields: Field[];
  columns: number;
}

interface GroupCheckListOption {
  GCLOptionID: number;
  CheckListOptions: {
    CLOptionID: string;
    CLOptionName: string;
  }[];
}

interface PreviewProps {
  style: any;
  form: {
    formName?: string;
    description?: string;
  };
  state: {
    subForms: SubForm[];
  };
  groupCheckListOption: GroupCheckListOption[];
  ShowMessages: (message: string) => void;
  formValues: { [key: string]: any };
  setFormValues: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
}

const Preview: React.FC<PreviewProps> = ({
  style,
  form,
  state,
  groupCheckListOption,
  ShowMessages,
  formValues,
  setFormValues,
}) => {
  const { styles, colors, spacing, responsive } = style;

  useEffect(() => {
    const initialValues: { [key: string]: any } = {};
    state.subForms.forEach((subForm) => {
      subForm.fields.forEach((field) => {
        initialValues[field.matchCheckListId] = field.expectedResult || "";
      });
    });
    setFormValues(initialValues);
  }, [state.subForms, setFormValues]);

  const handleChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const renderField = (field: Field) => {
    const fieldName = field.matchCheckListId;

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
            value={formValues[fieldName] || ""}
            handleChange={(value: string) => handleChange(fieldName, value)}
          />
        );
      case "Textarea":
        return (
          <Textareas
            placeholder={field.placeholder}
            hint={field.hint}
            label={field.CheckListName}
            value={formValues[fieldName] || ""}
            handleChange={(value: string) => handleChange(fieldName, value)}
          />
        );
      case "Dropdown":
        return (
          <Selects
            option={option}
            hint={field.hint}
            label={field.CheckListName}
            value={formValues[fieldName] || ""}
            handleChange={(value: string) => handleChange(fieldName, value)}
          />
        );
      case "Radio":
        return (
          <Radios
            option={option}
            hint={field.hint}
            label={field.CheckListName}
            value={formValues[fieldName] || ""}
            handleChange={(value: string) => handleChange(fieldName, value)}
          />
        );
      case "Checkbox":
        return (
          <Checkboxs
            option={option}
            hint={field.hint}
            label={field.CheckListName}
            value={formValues[fieldName] || ""}
            handleChange={(value: string[]) => handleChange(fieldName, value)}
          />
        );
      default:
        return null;
    }
  };

  const renderFields = (subForm: SubForm) => {
    return subForm.fields.map((field, fieldIndex) => {
      const containerStyle = {
        flexBasis:
          responsive === "small" || responsive === "medium"
            ? "100%"
            : `${100 / subForm.columns}%`,
        flexGrow: field.displayOrder || 1,
        padding: 5,
      };

      return (
        <View
          key={`field-${fieldIndex}-${subForm.subFormName}`}
        >
          <Text
            style={[styles.text, styles.textDark, { paddingLeft: spacing.sm }]}
          >
            {field.CheckListName}
          </Text>
          {renderField(field)}
        </View>
      );
    });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
      <Text style={[styles.textHeader, { color: colors.palette.dark }]}>
        {form.formName || "Content Name"}
      </Text>
     

      <View>
        {state.subForms.map((subForm, index) => (
          <View style={styles.card} key={`subForm-${index}`}>
            <Text style={styles.cardTitle}>{subForm.subFormName}</Text>
            <View style={styles.formContainer}>{renderFields(subForm)}</View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Preview;
