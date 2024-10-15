import { StyleSheet, Text, ScrollView, View, ViewStyle } from "react-native";
import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import { ActivityIndicator, Card, Divider, HelperText } from "react-native-paper";
import { useRes } from "@/app/contexts";
import { BaseFormState, BaseSubForm } from '@/typing/form';
import { AccessibleView, Dynamic } from "@/components";
import useForm from "@/hooks/custom/useForm";
import { PreviewProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import { FastField, Field, Formik } from "formik";

const Preview = forwardRef<any, any>((props, ref) => {
    const { route, validationSchema } = props;
    const { found, state, groupCheckListOption } = useForm(route);

    const masterdataStyles = useMasterdataStyles();
    console.log(validationSchema);

    const cardRef = useRef<View>(null);
    const { responsive } = useRes();
    const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

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

                {/* {state.subForms.length > 0 ? ( */}

                <ScrollView style={{ flex: 1 }}>

                    <Formik
                        initialValues={formValues}
                        validationSchema={validationSchema}
                        validateOnBlur={true}
                        validateOnChange={false}
                        onSubmit={(value) => console.log(value)}
                    >
                        {({ handleSubmit, isValid, dirty }) => (
                            <>
                                {state.subForms.map((subForm: BaseSubForm, index: number) => (
                                    <Card style={masterdataStyles.card} ref={(el) => (cardRefs.current[index] = el)} key={subForm.SFormID}>
                                        <Card.Title title={subForm.SFormName} titleStyle={masterdataStyles.cardTitle} />
                                        <Card.Content style={masterdataStyles.subFormContainer}>
                                            {subForm.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                                                const columns = subForm.Columns ?? 1;

                                                const containerStyle: ViewStyle = {
                                                    flexBasis: responsive === "small" ? "100%" : `${98 / columns}%`,
                                                    // flexGrow: field.DisplayOrder || 1,
                                                    padding: 5,
                                                    // borderRightWidth: isLastColumn ? 0 : 1,
                                                    // flexDirection: 'column',
                                                    // flexWrap: 'wrap',
                                                    marginHorizontal: 5,
                                                };
                                                console.log(containerStyle);

                                                return (
                                                    <FastField name={field.MCListID}>
                                                        {({ fields, form }: any) => (
                                                            <AccessibleView name="contianer-layout2" key={`fieldid-${fields.CListID}-field-${fieldIndex}-${subForm.SFormID}`} style={containerStyle}>
                                                                <Dynamic
                                                                    field={field}
                                                                    values={fields.value}
                                                                    handleChange={(fieldname: string, value: any) => {
                                                                        form.setFieldValue(fields.name, value)
                                                                        setTimeout(() => {
                                                                            form.setTouched({ ...form.touched, [fields.name]: true })
                                                                        }, 0)
                                                                    }}
                                                                    groupCheckListOption={groupCheckListOption}
                                                                />
                                                                <HelperText type="error" visible={form.touched[fields.name] && Boolean(form.errors[fields.name])} style={{ left: -10 }}>
                                                                    {form.errors[fields.name] || ""}
                                                                </HelperText>
                                                            </AccessibleView>

                                                        )}
                                                    </FastField>
                                                );
                                            })}

                                        </Card.Content>
                                    </Card>
                                ))}
                            </>
                        )}
                    </Formik>
                </ScrollView>
                {/* ) : (<ActivityIndicator size="large" color="#0000ff" />)} */}
            </>

        </AccessibleView>
    );
});

export default React.memo(Preview);
