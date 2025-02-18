import React, { useState, useCallback, useMemo } from "react";
import axiosInstance from "@/config/axios";
import { Card, Divider } from "react-native-paper";
import { TouchableOpacity, View } from "react-native";
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
import Formfield from "./Formfield";
import { useRes } from "@/app/contexts/useRes";
import { FormValues } from "@/typing/screens/CreateForm";
import ShimmerPlaceholder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { FlatList } from "react-native-gesture-handler";

const isValidDateFormatCustom = (value: string) => {
  const dateRegex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;
  return dateRegex.test(value);
};

const MemoizedFormfield = React.memo(({ dataType, item, field, values, setFieldValue, setFieldTouched, errors, touched }: any) => {
  return (
    <Formfield
      dataType={dataType}
      item={item}
      field={field}
      values={values}
      setFieldValue={setFieldValue}
      setFieldTouched={setFieldTouched}
      errors={errors}
      touched={touched}
    />
  );
});


const InputFormMachine = React.memo((props: PreviewProps<ScanParams>) => {
  const { route } = props;
  const { dataType, found, isLoadingForm } = useForm(route);
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

  const state = useSelector((state: any) => state.form);
  const user = useSelector((state: any) => state.user);
  const prefix = useSelector((state: any) => state.prefix);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [status, setStatus] = useState(false);

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
  const { responsive } = useRes();

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
      UserName: user.UserName,
      GUserID: user.GUserID,
    };

    const data = {
      Prefix: prefix.PF_ExpectedResult,
      FormData: JSON.stringify(updatedSubForms),
      UserInfo: JSON.stringify(userData),
    };

    try {
      const response = await axiosInstance.post("ExpectedResult/SaveExpectedResult", data);
      showSuccess(String(response.data.message));
      setStatus(response.data.status);
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
    return (
      <View style={{ flex: 1, marginTop: 5, marginHorizontal: 10 }}>
        <ShimmerPlaceholder style={{ margin: 5, width: 300, borderRadius: 10 }} width={300} />
        <ShimmerPlaceholder style={{ margin: 5, width: 600, borderRadius: 10 }} width={600} />

        <ShimmerPlaceholder style={{ marginTop: 20, marginHorizontal: 5, height: 500, width: '100%', borderRadius: 10 }} width={800} />

        <ShimmerPlaceholder style={{ alignSelf: 'center', marginTop: 20, marginHorizontal: 5, height: 50, width: 300, borderRadius: 10 }} width={300} />
      </View>
    )
  }

  return found ? state.FormID ? (
    <View id="container-form-scan" style={[masterdataStyles.container, { paddingTop: 10, paddingLeft: 10 }]} key={responsive}>
      <Stack.Screen options={{ headerTitle: `${state.MachineName || "Machine Name"}` }} />

      {!isSubmitted ? (
        <Formik
          initialValues={formValues}
          validationSchema={validationSchema}
          validateOnBlur={false}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, setFieldTouched, values, dirty, isValid, handleSubmit }) => {

            return (
              <FlatList
                data={state.subForms}
                extraData={state.subForms}
                renderItem={({ item, index }) => {
                  return (
                    <Card style={masterdataStyles.card} key={index}>
                      <Card.Title title={item.SFormName} titleStyle={masterdataStyles.cardTitle} />
                      <Card.Content style={[masterdataStyles.subFormContainer]}>
                        {item.Fields && item.Fields.length > 0 && (
                          <MemoizedFormfield
                            dataType={dataType}
                            item={item}
                            field={item.Fields}
                            values={values}
                            setFieldValue={setFieldValue}
                            setFieldTouched={setFieldTouched}
                            errors={errors}
                            touched={touched}
                          />
                        )}
                      </Card.Content>
                    </Card>
                  );
                }}
                keyExtractor={(item, index) => `${index}-${item}`}
                ListHeaderComponent={() => (
                  <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                    <View style={{ alignSelf: 'center', flex: 1 }}>
                      <Text style={[masterdataStyles.title, { color: theme.colors.onBackground }]}>{state.FormName || "Form Name"}</Text>
                      <Divider />
                      <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>{state.Description || "Form Description"}</Text>
                    </View>
                  </View>
                )}
                ListFooterComponent={() => (
                  <>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <Text style={[masterdataStyles.description, { color: theme.colors.onBackground }]}>{state.FormNumber || "// F"}</Text>
                    </View>

                    <View id="form-action-scan" style={[masterdataStyles.containerAction]}>
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
                    </View>
                  </>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                removeClippedSubviews={true}
              />
            );
          }}
        </Formik>
      ) : (
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
    </View>
  ) : <AccessibleView name="form-success" style={masterdataStyles.containerScccess}>
    <Text style={masterdataStyles.text}>Not Found!</Text>
    <TouchableOpacity
      onPress={() => {
        setIsSubmitted(false);
        navigate("ScanQR");
      }}
      style={masterdataStyles.button}
    >
      <Text style={[masterdataStyles.textBold, masterdataStyles.text, { color: theme.colors.blue }]}>Scan again</Text>
    </TouchableOpacity>
  </AccessibleView> : <NotFoundScreen />
});

export default InputFormMachine;
