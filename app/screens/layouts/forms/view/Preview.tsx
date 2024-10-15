import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, Text, ScrollView, View, ViewStyle } from "react-native";
import { Card, Divider, HelperText } from "react-native-paper";
import { useRes } from "@/app/contexts";
import { BaseFormState, BaseSubForm } from '@/typing/form';
import { AccessibleView, Dynamic } from "@/components";
import useForm from "@/hooks/custom/useForm";
import { FastField, Formik, FieldProps } from "formik";
import useMasterdataStyles from "@/styles/common/masterdata";

interface FormValues {
    [key: string]: any;
}

const Preview = forwardRef<any, any>((props, ref) => {
    const { route, validationSchema } = props;
    const { found, state, groupCheckListOption } = useForm(route);

    const masterdataStyles = useMasterdataStyles();
    const cardRef = useRef<View>(null);
    const { responsive } = useRes();
    const [formValues, setFormValues] = useState<FormValues>({});

    const cardRefs = useRef<(View | null)[]>([]);
    const cardPositions = useRef<{ pageX: number; pageY: number; width: number; height: number }[]>([]);

    useEffect(() => {
        const positions: { pageX: number; pageY: number; width: number; height: number }[] = [];
        cardRefs.current.forEach((cardRef) => {
            if (cardRef) {
                cardRef.measure((x, y, width, height, pageX, pageY) => {
                    positions.push({ pageX, pageY, width, height });
                });
            }
        });
        cardPositions.current = positions;
    }, [state.subForms]);

    useImperativeHandle(ref, () => ({
        getCardPosition: (callback: (x: number, y: number) => void) => {
            if (cardRef.current) {
                cardRef.current.measure((x, y, width, height, pageX, pageY) => {
                    callback(pageX, pageY);
                });
            }
        },
        checkCardPosition: (x: number, y: number) => {
            return cardPositions.current.findIndex((card) =>
                x >= card.pageX && x <= card.pageX + card.width &&
                y >= card.pageY && y <= card.pageY + card.height
            );
        },
    }));

    useEffect(() => {
        if (state.subForms) {
            const initialValues: { [key: string]: any } = {};
            state.subForms.forEach((subForm: BaseSubForm) => {
                subForm.Fields?.forEach((field: BaseFormState) => {
                    initialValues[field.MCListID] = field.EResult ?? "";
                });
            });
            setFormValues(initialValues);
        }
    }, [state.subForms]);

    return (
        <AccessibleView name="preview" style={[masterdataStyles.container, { maxHeight: 900, paddingBottom: 30 }]}>
            <>
                <Text style={masterdataStyles.title}>{state.FormName || "Content Name"}</Text>
                <Divider />
                <Text style={masterdataStyles.description}>{state.Description || "Content Description"}</Text>

                <ScrollView style={{ flex: 1 }}>
                    {state.subForms.map((subForm: BaseSubForm, index: number) => (


                        <Formik
                            initialValues={formValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(value) => console.log(value)}
                            key={subForm.SFormID + subForm.Columns}
                        >
                            {({ errors, touched, setFieldValue, setTouched }) => (
                                <>
                                    <Card
                                        style={masterdataStyles.card}
                                        ref={(el) => (cardRefs.current[index] = el)}
                                        key={subForm.SFormID}
                                    >
                                        <Card.Title
                                            title={subForm.SFormName}
                                            titleStyle={masterdataStyles.cardTitle}
                                        />
                                        <Card.Content style={[masterdataStyles.subFormContainer , {flexWrap:'wrap-reverse'}]}>
                                            {subForm.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                                                const columns = subForm.Columns ?? 1;

                                                const containerStyle: ViewStyle = {
                                                    width: responsive === "small" ? "100%" : `${98 / columns}%`,
                                                    flexGrow: field.DisplayOrder || 1,
                                                    marginHorizontal: 5,
                                                };

                                                return (
                                                    <FastField name={field.MCListID} key={`field-${fieldIndex}-${columns}`}>
                                                        {({ field: fastFieldProps }: FieldProps) => (
                                                            <AccessibleView name="container-layout2" style={containerStyle}>
                                                                <Dynamic
                                                                    field={field}
                                                                    values={fastFieldProps.value}
                                                                    handleChange={(fieldName: string, value: any) => {
                                                                        setFieldValue(fastFieldProps.name, value);
                                                                        setTimeout(() => {
                                                                            setTouched({
                                                                                ...touched,
                                                                                [fastFieldProps.name]: true,
                                                                            });
                                                                        }, 0);
                                                                    }}
                                                                    groupCheckListOption={groupCheckListOption}
                                                                />
                                                                {Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name]) && (
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                        <HelperText
                                                                            type="error"
                                                                            visible={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
                                                                            style={{ left: -10 }}
                                                                        >
                                                                            {errors[fastFieldProps.name] || ""}
                                                                        </HelperText>
                                                                        <Text
                                                                            style={{ color: 'blue', marginLeft: 10 }}
                                                                            onPress={() => {
                                                                                setTouched({ ...touched, [fastFieldProps.name]: false });
                                                                            }}
                                                                        >
                                                                            Close
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </AccessibleView>
                                                        )}
                                                    </FastField>
                                                );
                                            })}
                                        </Card.Content>
                                    </Card>
                                </>
                            )}
                        </Formik>
                    ))}

                </ScrollView>
            </>
        </AccessibleView>
    );
});

export default React.memo(Preview);
