import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import { View, ViewStyle, FlatList, TouchableOpacity, Platform } from "react-native";
import { Card, Divider, Icon } from "react-native-paper";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import { BaseFormState, BaseSubForm } from '@/typing/form';
import { Dynamic, Text } from "@/components";
import { Formik, FieldProps, Field } from "formik";
import useMasterdataStyles from "@/styles/common/masterdata";
import { DataType } from "@/typing/type";
import { useSelector } from "react-redux";
import { FormValues } from "@/typing/screens/CreateForm";

const Preview = React.memo(forwardRef<any, any>((props, ref) => {
    const { validationSchema, dataType, isLoading, showField } = props;
    const state = useSelector((state: any) => state.form);

    const masterdataStyles = useMasterdataStyles();
    const cardRef = useRef<View>(null);
    const { responsive, spacing } = useRes();
    const [formValues, setFormValues] = useState<FormValues>({});
    const { theme, darkMode } = useTheme();
    const cardRefs = useRef<(View | null)[]>([]);
    const cardPositions = useRef<{ x: number; y: number; width: number; height: number }[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleScroll = useCallback(() => {
        updateCardPositions();
    }, []);

    const updateCardPositions = () => {
        const positions: { x: number; y: number; width: number; height: number }[] = [];
        cardRefs.current.forEach((cardRef, index) => {
            if (cardRef) {
                cardRef.measureInWindow((x, y, width, height) => {
                    positions.push({ x, y, width: width + 350, height: height + 16 });
                });
            }
        });
        cardPositions.current = positions;
    };

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            updateCardPositions();
        }, 100);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [state]);

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
                x >= card.x && x <= card.x + card.width &&
                y >= card.y && y <= card.y + card.height
            );
        },
    }));

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
    }, [state.subForms]);

    const countRef = useRef(1);

    const incrementCount = (value: boolean) => {
        if (value)
            countRef.current += 1
        else
            countRef.current = 1
    };

    return (
        <View id="container-form-scan" style={[masterdataStyles.container, { paddingTop: 30, paddingLeft: 10 }]}>
            <FlatList
                data={[{}]}
                renderItem={() =>
                    state.subForms.map((subForm: BaseSubForm, index: number) => {
                        return (
                            <Formik
                                initialValues={formValues}
                                validationSchema={validationSchema}
                                validateOnBlur={true}
                                validateOnChange={false}
                                onSubmit={(value) => { }}
                                enableReinitialize={true}
                                key={JSON.stringify({ SFormID: subForm.SFormID, Column: subForm.Columns, fields: subForm.Fields })}
                            >
                                {({ errors, touched, setFieldValue, setTouched, setFieldError, values }) => {
                                    incrementCount(false);
                                    return (
                                        <Card
                                            style={masterdataStyles.card}
                                            ref={(el) => (cardRefs.current[index] = el)}
                                            key={subForm.SFormID}
                                        >
                                            <TouchableOpacity onPress={() => showField && showField(undefined, String(subForm.SFormID))}>
                                                <Card.Title
                                                    title={subForm.SFormName}
                                                    titleStyle={masterdataStyles.cardTitle}
                                                />
                                            </TouchableOpacity>

                                            <Card.Content style={masterdataStyles.subFormContainer}>
                                                {subForm.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                                                    const columns = subForm.Columns ?? 1;
                                                    const ChheckList = subForm.Number ? `${countRef.current}. ${field.CListName}` : field.CListName;
                                                    incrementCount(subForm.Number);

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

                                                                return (
                                                                    <View id="container-layout2" style={containerStyle}>
                                                                        <Dynamic
                                                                            field={field}
                                                                            values={String(fastFieldProps.value ?? "")}
                                                                            handleChange={(fieldname: string, value: any) => {
                                                                                setFieldValue(fastFieldProps.name, value);
                                                                                setTimeout(() => {
                                                                                    setTouched({
                                                                                        ...touched,
                                                                                        [fastFieldProps.name]: true,
                                                                                    });
                                                                                }, 0);
                                                                            }}
                                                                            handleBlur={handleBlur}
                                                                            error={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
                                                                            errorMessages={errors}
                                                                            number={ChheckList}
                                                                            showField={showField}
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
                                    );
                                }}
                            </Formik>
                        );
                    })
                }
                ListHeaderComponent={() => (
                    <>
                        <Text style={[masterdataStyles.title, { color: theme.colors.onBackground }]}>{state.FormName || "Form Name"}</Text>
                        <Divider />
                        <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>{state.Description || "Form Description"}</Text>
                    </>
                )}
                ListFooterComponent={() =>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={[masterdataStyles.description, { color: theme.colors.onBackground }]}>{state.FormNumber || "// F"}</Text>
                    </View>
                }
                keyExtractor={(_, index) => `index-preview-${index}`}
                onScroll={handleScroll}
                scrollEventThrottle={-30}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}));

export default Preview;
