import React, { useEffect, useState, forwardRef, useMemo, useRef } from "react";
import { View, ViewStyle, FlatList } from "react-native";
import { Card, Divider } from "react-native-paper";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import { BaseFormState, BaseSubForm } from '@/typing/form';
import { AccessibleView, Dynamic, Text } from "@/components";
import { Formik, FieldProps, Field } from "formik";
import useMasterdataStyles from "@/styles/common/masterdata";
import { DataType } from "@/typing/type";
import { useSelector } from "react-redux";
import useForm from "@/hooks/custom/useForm";
import * as Yup from 'yup';
import { Stack } from "expo-router";
import { FormValues } from "@/typing/screens/CreateForm";
import ShimmerPlaceholder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const isValidDateFormatCustom = (value: string) => {
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;
    return dateRegex.test(value);
};

const PreviewScreen = React.memo(forwardRef<any, any>((props, ref) => {
    const { route } = props;
    const { dataType, exp, isLoadingForm, found } = useForm(route);
    const [load, setLoad] = useState(true)
    const state = useSelector((state: any) => state.form);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

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
                        })
                } else if (field.CTypeName === "Checkbox") {
                    validator = Yup.array()
                        .of(Yup.string().required("Each selected option is required."))
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
    const { responsive } = useRes();
    const [formValues, setFormValues] = useState<FormValues>({});
    const { theme } = useTheme()

    useEffect(() => {
        if (state.subForms) {
            const initialValues: { [key: string]: any } = {};
            state.subForms.forEach((subForm: BaseSubForm) => {
                subForm.Fields.forEach((field: BaseFormState) => {
                    initialValues[field.MCListID] = field.EResult ?? "";
                });
            });
            setFormValues(initialValues);
        }
    }, [state]);

    const countRef = useRef(1);

    const incrementCount = (value: boolean) => {
        if (value)
            countRef.current += 1
        else
            countRef.current = 1
    };

    useEffect(() => {
        if (!isLoadingForm && found) {
            state.UserID && setLoad(false)
            !exp && setLoad(false)
        }
    }, [isLoadingForm, found, state.UserID, exp])

    const convertToThaiDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear() + 543;
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} เวลา ${hours}:${minutes}`;
    };

    return !load ? (
        <AccessibleView name="container-form-scan" style={[masterdataStyles.container, { paddingTop: 10, paddingLeft: 10 }]}>
            <Stack.Screen
                options={{
                    headerTitle: `${state.FormName || "Form Name"}`,
                }}
            />
            <FlatList
                data={[{}]}
                renderItem={() => state.subForms.map((subForm: BaseSubForm, index: number) => (
                    <Formik
                        initialValues={formValues}
                        validationSchema={validationSchema}
                        validateOnBlur={true}
                        validateOnChange={false}
                        onSubmit={(value) => { }}
                        enableReinitialize={true}
                        key={exp ? `Form-Expected-${subForm.SFormID}-${subForm.Columns}` : `Form-Preview-${subForm.SFormID}-${subForm.Columns}`}
                    >
                        {({ errors, touched, setFieldValue, setTouched }) => {
                            incrementCount(false);

                            return (
                                <>
                                    <Card
                                        style={masterdataStyles.card}
                                        key={subForm.SFormID}
                                    >
                                        <Card.Title
                                            title={subForm.SFormName}
                                            titleStyle={masterdataStyles.cardTitle}
                                        />
                                        <Card.Content style={[masterdataStyles.subFormContainer]}>
                                            {subForm.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                                                const columns = subForm.Columns ?? 1;

                                                const containerStyle: ViewStyle = {
                                                    width: responsive === "small" ? "100%" : `${98 / columns}%`,
                                                    // flexShrink: 1,
                                                    flex: 1,
                                                    flexBasis: responsive === "small" ? "100%" : `${100 / (columns / ((field.Rowcolumn || 1) > columns ? columns : field.Rowcolumn || 1))}%`,
                                                    padding: 5,
                                                };

                                                return (
                                                    <Field name={field.MCListID} key={`field-${fieldIndex}-${subForm.Columns}`}>
                                                        {({ field: fastFieldProps }: FieldProps) => {
                                                            const type = dataType.find((v: DataType) => v.DTypeID === field.DTypeID)?.DTypeName;

                                                            const ChheckList = subForm.Number ? `${countRef.current}. ${field.CListName}` : field.CListName;
                                                            incrementCount(subForm.Number);

                                                            const handleBlur = () => {
                                                                if (type === "Number") {
                                                                    const numericValue = Number(fastFieldProps.value);

                                                                    if (!isNaN(numericValue) && Number(field.DTypeValue) > 0 && numericValue) {
                                                                        const formattedValue = numericValue.toFixed(Number(field.DTypeValue));
                                                                        setFieldValue(fastFieldProps.name, formattedValue);
                                                                        setTouched({
                                                                            ...touched,
                                                                            [fastFieldProps.name]: true,
                                                                        });

                                                                    } else if (isNaN(numericValue)) {
                                                                        setFieldValue(fastFieldProps.name, fastFieldProps.value);
                                                                        setTouched({
                                                                            ...touched,
                                                                            [fastFieldProps.name]: true,
                                                                        });
                                                                    }
                                                                }
                                                            };

                                                            const handleChange = (fieldName: string, value: any) => {
                                                                setFieldValue(fieldName, value);

                                                                if (timeoutRef.current) {
                                                                    clearTimeout(timeoutRef.current);
                                                                }

                                                                timeoutRef.current = setTimeout(() => setTouched({ ...touched, [fieldName]: true }), 0);
                                                            };

                                                            return (
                                                                <View id="container-layout2" style={containerStyle}>
                                                                    <Dynamic
                                                                        field={field}
                                                                        values={String(fastFieldProps.value ?? "")}
                                                                        handleChange={handleChange}
                                                                        handleBlur={handleBlur}
                                                                        error={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
                                                                        errorMessages={errors}
                                                                        number={ChheckList}
                                                                        exp={exp}
                                                                        type={type}
                                                                    />
                                                                </View>
                                                            );
                                                        }}
                                                    </Field>
                                                );
                                            })}
                                        </Card.Content>
                                    </Card>
                                </>
                            )
                        }}
                    </Formik>
                ))}
                ListHeaderComponent={() => (
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                        <View style={{ alignSelf: 'center', flex: 1 }}>
                            <Text style={[masterdataStyles.title, { color: theme.colors.onBackground }]}>{state.FormName || "Form Name"}</Text>
                            <Divider />
                            <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>{state.Description || "Form Description"}</Text>
                        </View>
                        {state.CreateDate && (
                            <View style={{ marginLeft: 30 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>Submit Time : </Text>
                                    <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>{convertToThaiDateTime(state?.CreateDate) || "Time Submit"}</Text>
                                </View>
                                {state.ApprovedTime && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>Approved Time : </Text>
                                        <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>{convertToThaiDateTime(state?.ApprovedTime) || "Time Submit"}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )}
                ListFooterComponent={() =>
                    <>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Text style={[masterdataStyles.description, { color: theme.colors.onBackground }]}>{state.FormNumber || "// F"}</Text>
                        </View>

                        {exp && (
                            <View style={{ flexDirection: 'row', marginLeft: 10, marginVertical: 10 }}>
                                <View style={{ marginRight: 30 }}>
                                    <Text style={[masterdataStyles.description, { color: theme.colors.onBackground }]}>Inspector</Text>
                                    <Divider />
                                    <Text style={[masterdataStyles.title, { paddingVertical: 10, color: theme.colors.onBackground }]}>{state?.UserName || "User Submit"}</Text>
                                </View>

                                {state?.ApprovedName && (
                                    <View>
                                        <Text style={[masterdataStyles.description, { color: theme.colors.onBackground }]}>Acknowledged</Text>
                                        <Divider />
                                        <Text style={[masterdataStyles.title, { paddingVertical: 10, color: theme.colors.onBackground }]}>{state?.ApprovedName || "User Approved"}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </>
                }
                keyExtractor={(_, index) => `index-preview-${index}`}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </AccessibleView>
    ) : (
        <View style={{ flex: 1, marginTop: 5, marginHorizontal: 10 }}>
            <ShimmerPlaceholder style={{ margin: 5, width: 300, borderRadius: 10 }} width={300} />
            <ShimmerPlaceholder style={{ margin: 5, width: 600, borderRadius: 10 }} width={600} />

            <ShimmerPlaceholder style={{ marginTop: 20, marginHorizontal: 5, height: 500, width: '100%', borderRadius: 10 }} width={800} />

            <ShimmerPlaceholder style={{ alignSelf: 'center', marginTop: 20, marginHorizontal: 5, height: 50, width: 300, borderRadius: 10 }} width={300} />
        </View>
    )
}));

export default PreviewScreen;
