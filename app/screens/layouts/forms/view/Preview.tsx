import { StyleSheet, Text, ScrollView, View, ViewStyle } from "react-native";
import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import { ActivityIndicator, Card, Divider } from "react-native-paper";
import { useRes } from "@/app/contexts";
import { BaseFormState, BaseSubForm } from '@/typing/form';
import { AccessibleView, Dynamic } from "@/components";
import useForm from "@/hooks/custom/useForm";
import { PreviewProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";

const Preview = forwardRef<any, any>((props, ref) => {
    const { route } = props;
    const { found, state, groupCheckListOption } = useForm(route);

    const masterdataStyles = useMasterdataStyles();

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
        <AccessibleView name="preview" style={[masterdataStyles.container, { maxHeight: 900, paddingBottom: 30 }]}>
            {state.subForms.length > 0 ? (
                <>
                    <Text style={masterdataStyles.title}>{state.FormName || "Content Name"}</Text>
                    <Divider />
                    <Text style={masterdataStyles.description}>{state.Description || "Content Description"}</Text>

                    <ScrollView style={{ flex: 1 }}>
                        {state.subForms.map((subForm: BaseSubForm, index: number) => (
                            <AccessibleView name="gen-subForm" key={`subForm-${index}`}>
                                <Card style={masterdataStyles.card} ref={(el) => (cardRefs.current[index] = el)}>
                                    <Card.Title title={subForm.SFormName} titleStyle={masterdataStyles.cardTitle} />
                                    <Card.Content style={masterdataStyles.subFormContainer}>
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
                                                        values={formValues?.[field.MCListID]}
                                                        handleChange={(fieldname: string, value: any) => handleChange(fieldname, value)}
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
                </>
            ) : (<ActivityIndicator size="large" color="#0000ff" />)}

        </AccessibleView>
    );
});

export default React.memo(Preview);
