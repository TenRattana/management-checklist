import React, { useState, useCallback, useMemo, useRef } from "react";
import axiosInstance from "@/config/axios";
import { Card, Divider } from "react-native-paper";
import { FlatList, TouchableOpacity } from "react-native";
import { useTheme } from "@/app/contexts/useTheme";
import { useToast } from "@/app/contexts/useToast";
import { BaseSubForm, BaseFormState } from '@/typing/form';
import { AccessibleView, NotFoundScreen, Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { PreviewProps } from "@/typing/tag";
import { ScanParams } from "@/typing/tag";
import { Formik } from 'formik';
import useForm from "@/hooks/custom/useForm";
import { useSelector } from "react-redux";
import * as Yup from 'yup';
import { Stack } from "expo-router";
import { navigate } from "@/app/navigations/navigationUtils";
import Submit from "@/components/common/Submit";
import Formfield from "./Formfield";

interface FormValues {
  [key: string]: any;
}

const isValidDateFormatCustom = (value: string) => {
  const dateRegex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;
  return dateRegex.test(value);
};

const InputFormMachine: React.FC<PreviewProps<ScanParams>> = React.memo((props) => {
  const { route } = props;
  const { dataType, found, isLoadingForm } = useForm(route);

  const state = useSelector((state: any) => state.form);
  const user = useSelector((state: any) => state.user);
  const prefix = useSelector((state: any) => state.prefix);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({});

  const validationSchema = useMemo(() => {
    const shape: Record<string, any> = {};
    state.subForms.forEach((subForm: BaseSubForm) => {
      subForm.Fields.forEach((field: BaseFormState) => {
        const dataTypeName = dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
        let validator;

        if (dataTypeName === "Number") {
          validator = Yup.number()
            .nullable()
            .typeError(`The ${field.CListName} field must be a valid number`);
        } else if (dataTypeName === "Date") {
          validator = Yup.string()
            .nullable()
            .test('is-valid-date', 'Invalid date format', value => {
              return value ? isValidDateFormatCustom(String(value)) : true;
            });
        } else if (field.CTypeName === "Checkbox") {
          validator = Yup.array()
            .of(Yup.string().required("Each selected option is required."));
        } else {
          validator = Yup.string()
            .nullable()
            .typeError(`The ${field.CListName} field must be a valid string`);
        }

        if (field.Required) validator = validator.required(`The ${field.CListName} field is required`);

        if (field.Required && field.CTypeName === "Checkbox") {
          validator = validator.min(1, "You must select at least one option.").required("Important value is required when marked as important.");
        }

        shape[field.MCListID] = validator;
      });
    });
    return Yup.object().shape(shape);
  }, [state.subForms, dataType]);

  const masterdataStyles = useMasterdataStyles();
  const { showSuccess, handleError } = useToast();
  const { theme } = useTheme();

  const onFormSubmit = useCallback(async (values: { [key: string]: any }) => {
    const updatedSubForms = state.subForms.map((subForm: BaseSubForm) => ({
      ...subForm,
      MachineID: state.MachineID,
      Fields: subForm?.Fields?.map((field: BaseFormState) => ({
        ...field,
        EResult: values[field.MCListID] || "",
      })),
    }));

    const userData = {
      UserID: user.UserID,
      UserName: user.Full_Name,
      GUserID: user.GUserID,
    };

    const data = {
      Prefix: prefix.PF_ExpectedResult,
      FormData: JSON.stringify(updatedSubForms),
      UserInfo: JSON.stringify(userData),
    };

    try {
      const response = await axiosInstance.post("ExpectedResult_service.asmx/SaveExpectedResult", data);
      showSuccess(String(response.data.message));
      setIsSubmitted(true);
    } catch (error) {
      handleError(error);
    }
  }, [showSuccess, handleError, state.subForms, state.MachineID, user]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (values: { [key: string]: any }) => {
    setIsSubmitting(true);
    onFormSubmit(values);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  }, [onFormSubmit]);

  if (isLoadingForm || !found) {
    return <Text>Loading Form...</Text>;
  }

  return found ? (
    <AccessibleView name="container-form-scan" style={[masterdataStyles.container, { paddingTop: 10, paddingLeft: 10 }]}>
      <Stack.Screen options={{ headerTitle: `${state.MachineName || "Machine Name"}` }} />

      {!isSubmitted ? (
        <Formik
          initialValues={formValues}
          validationSchema={validationSchema}
          validateOnBlur={false}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, setTouched, values, dirty, isValid, handleSubmit }) => {

            return (
              <FlatList
                data={state.subForms}
                renderItem={({ item }) => {
                  return (
                    <Card style={masterdataStyles.card} key={item.SFormID}>
                      <Card.Title title={item.SFormName} titleStyle={masterdataStyles.cardTitle} />
                      <Card.Content style={[masterdataStyles.subFormContainer]}>
                        {item.Fields && item.Fields.length > 0 && (
                          <Formfield
                            dataType={dataType}
                            item={item}
                            field={item.Fields}
                            values={values}
                            setFieldValue={setFieldValue}
                            setTouched={setTouched}
                            errors={errors}
                            touched={touched}
                          />
                        )}
                      </Card.Content>
                    </Card>
                  );
                }}
                keyExtractor={(item) => `index-preview-${item.SFormID}`}
                ListHeaderComponent={() => (
                  <>
                    <Text style={[masterdataStyles.title, { color: theme.colors.onBackground }]}>{state.FormName || "Form Name"}</Text>
                    <Divider />
                    <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>{state.Description || "Form Description"}</Text>
                  </>
                )}
                ListFooterComponent={() => (
                  <AccessibleView name="form-action-scan" style={[masterdataStyles.containerAction]}>
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      style={[
                        masterdataStyles.button,
                        masterdataStyles.backMain,
                        { opacity: isValid && dirty ? 1 : 0.5 },
                      ]}
                      disabled={!dirty || !isValid}
                    >
                      <Text style={[masterdataStyles.textBold, masterdataStyles.textFFF]}>Submit Form</Text>
                    </TouchableOpacity>
                  </AccessibleView>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                removeClippedSubviews={true}
              />
            );
          }}
        </Formik>
      ) : isSubmitting ? <Submit />
        : (
          <AccessibleView name="form-success" style={masterdataStyles.containerScccess}>
            <Text style={masterdataStyles.text}>Save success</Text>
            <TouchableOpacity
              onPress={() => {
                setIsSubmitted(false);
                navigate("ScanQR");
              }}
              style={masterdataStyles.button}
            >
              <Text style={[masterdataStyles.textBold, masterdataStyles.text, { color: theme.colors.blue }]}>Scan again</Text>
            </TouchableOpacity>
          </AccessibleView>
        )}
    </AccessibleView>
  ) : <NotFoundScreen />
});

export default InputFormMachine;
