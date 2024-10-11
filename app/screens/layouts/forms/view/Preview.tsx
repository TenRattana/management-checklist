import { StyleSheet, Text, ScrollView, View, ViewStyle } from "react-native";
import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import { Card, Divider } from "react-native-paper";
import { useRes } from "@/app/contexts";
import { BaseFormState, BaseSubForm } from '@/typing/form';
import { AccessibleView, Dynamic } from "@/components";
import useForm from "@/hooks/custom/useForm";
import { PreviewProps } from "@/typing/tag";

const Preview = forwardRef<any, any>((props, ref) => {
    const { route } = props;
    const { found, state, groupCheckListOption } = useForm(route);
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

    const handleChange = useCallback((fieldName: string, value: any) => {
        setFormValues((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    }, []);

    return (
        <AccessibleView name="preview" style={styles.container}>
            <Text style={styles.title}>{state.FormName || "Content Name"}</Text>
            <Divider />
            <Text style={styles.description}>{state.Description || "Content Description"}</Text>

            <ScrollView style={{ flex: 1 }}>
                {state.subForms.map((subForm: BaseSubForm, index: number) => (
                    <AccessibleView name="gen-subForm" key={`subForm-${index}`}>
                        <Card style={styles.card} ref={(el) => (cardRefs.current[index] = el)}>
                            <Card.Title title={subForm.SFormName} titleStyle={styles.cardTitle} />
                            <Card.Content style={styles.subFormContainer}>
                                {subForm.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                                    const columns = subForm.Columns ?? 1;
                                    const columnWidth = responsive === "small" ? "100" : 100 / columns;

                                    const containerStyle: ViewStyle = {
                                        flexBasis: `${columnWidth}%`,
                                        flexGrow: field.DisplayOrder || 1,
                                        flexDirection: "row",
                                        flexWrap: "nowrap",
                                    };

                                    return (
                                        <AccessibleView
                                            name="container-layout2"
                                            key={`field-${fieldIndex}-${subForm.SFormName}`}
                                            style={containerStyle}
                                        >
                                            <Dynamic
                                                field={field}
                                                values={formValues}
                                                setFieldValue={handleChange}
                                                groupCheckListOption={groupCheckListOption}
                                            />
                                        </AccessibleView>
                                    );
                                })}
                            </Card.Content>
                        </Card>
                    </AccessibleView>
                ))}
            </ScrollView>
        </AccessibleView>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    description: {
        fontSize: 20,
        marginBottom: 16,
    },
    subFormContainer: {
        marginBottom: 16,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    card: {
        paddingVertical: 16,
        borderRadius: 8,
        elevation: 2,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
});

export default React.memo(Preview);
