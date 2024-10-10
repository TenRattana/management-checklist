import { StyleSheet, Text, ScrollView, View, ViewStyle, Pressable } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { Card, Divider } from "react-native-paper";
import { useRes } from "@/app/contexts";
import { BaseFormState, BaseSubForm } from '@/typing/form';
import { AccessibleView, Dynamic, NotFoundScreen } from "@/components";
import useForm from "@/hooks/custom/useForm";
import { PreviewProps } from "@/typing/tag";
import { PreviewParams } from "@/typing/tag";

const Preview: React.FC<PreviewProps<PreviewParams>> = ({ route }) => {
    const {
        found,
        state,
        groupCheckListOption,
    } = useForm(route);
    console.log("Preview");

    const { responsive } = useRes();
    const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

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
        <AccessibleView style={styles.container}>
            <Text style={styles.title}>{state.FormName || "Content Name"}</Text>
            <Divider />
            <Text style={[styles.description]}>{state.Description || "Content Description"}</Text>

            <ScrollView style={{ flex: 1 }}>
                {state.subForms.map((subForm: BaseSubForm, index: number) => (
                    <AccessibleView key={`subForm-${index}`} >
                        <Card style={styles.card}>
                            <Card.Title title={subForm.SFormName} titleStyle={styles.cardTitle} />
                            <Card.Content style={styles.subFormContainer}>
                                {subForm.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                                    const columns = subForm.Columns ?? 1;
                                    const borderRightWidth = 1;
                                    const totalBorderWidth = (columns - 1) * borderRightWidth;

                                    const isLastColumn = (fieldIndex + 1) % columns === 0;

                                    const columnWidth = responsive === "small"
                                        ? "100"
                                        : 100 / columns;

                                    const containerStyle: ViewStyle = {
                                        flexBasis: `${columnWidth}%`,
                                        flexGrow: field.DisplayOrder || 1,
                                        //  borderRightWidth: isLastColumn ? 0 : borderRightWidth, 
                                        flexDirection: "row",
                                        flexWrap: "nowrap",
                                    };

                                    return (
                                        <AccessibleView
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
};

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
    subFormTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
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
    submitText: {
        textAlign: 'center',
        padding: 10,
        backgroundColor: '#007BFF',
        color: '#FFF',
        borderRadius: 5,
        marginTop: 20,
    },
});

export default React.memo(Preview);
