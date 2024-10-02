import React, { useState, useCallback, useRef, useMemo } from "react";
import {
    Animated,
    Pressable,
    Text,
    StyleSheet,
    ScrollView,
    View,
} from "react-native";
import {
    setDragSubForm,
    setDragField,
    deleteSubForm,
} from "@/slices";
import { useForm } from '@/hooks/custom/useForm';
import { AccessibleView } from "@/components";
import SubFormDialog from "@/components/forms/SubFormDialog";
import { useToast } from "@/app/contexts";
import useCreateformStyle from "@/styles/createform";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { Icon } from "react-native-paper";
import axiosInstance from "@/config/axios";

interface FormState {
    MCListID: string;
    CListID: string;
    GCLOptionID: string;
    CTypeID: string;
    CListName?: string;
    CTypeName?: string;
    DTypeID: string;
    DTypeValue?: number;
    SFormID: string;
    Required: boolean;
    MinLength?: number;
    MaxLength?: number;
    Description: string;
    Placeholder: string;
    Hint: string;
    DisplayOrder?: number;
    EResult: string;
}
interface BaseSubForm {
    SFormID: string;
    SFormName: string;
    FormID: string;
    Columns?: number;
    DisplayOrder?: number;
    MachineID: string;
    Fields?: FormState[];
}

interface BaseForm {
    FormID: string;
    FormName: string;
    Description: string;
    MachineID: string;
}

interface CreateFormProps {
    route: any;
}

const CreateFormScreen: React.FC<CreateFormProps> = ({ route }) => {
    const { state, dispatch, checkListType } = useForm(route);
    const [initialDialog, setInitialDialog] = useState<{ form: boolean, subform: boolean, save: boolean, field: boolean }>({ form: false, subform: false, save: false, field: false })
    const [initialForm, setInitialForm] = useState<BaseForm>({ FormID: "", FormName: "", Description: "", MachineID: "" });
    const [initialSubForm, setInitialSubForm] = useState<BaseSubForm>({ SFormID: "", SFormName: "", FormID: "", MachineID: "" });
    const [initialField, setInitialField] = useState<FormState>({ MCListID: "", CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: "", Required: false, Description: "", Placeholder: "", Hint: "", EResult: "", CListName: "", CTypeName: "", DTypeValue: undefined, MinLength: undefined, MaxLength: undefined });
    const [editMode, setEditMode] = useState<boolean>(false)

    const { showError } = useToast();
    const createform = useCreateformStyle();

    const scaleValues = useRef<{ [key: string]: Animated.Value }>({});

    const getScaleValue = (subFormID: string) => {
        if (!scaleValues.current[subFormID]) {
            scaleValues.current[subFormID] = new Animated.Value(1);
        }
        return scaleValues.current[subFormID];
    };

    const animatedDefault = useMemo(() => {
        return { toValue: 1, useNativeDriver: true };
    }, []);

    const animatedScale = useMemo(() => {
        return { toValue: 0.95, useNativeDriver: true };
    }, []);

    const onPressIn = (subFormID: string) => {
        Animated.spring(getScaleValue(subFormID), animatedScale).start();
    };

    const onPressOut = (subFormID: string) => {
        Animated.spring(getScaleValue(subFormID), animatedDefault).start();
    };

    const handelSetDialog = useCallback(() => {
        setEditMode(false)
        setInitialDialog({ form: false, subform: false, save: false, field: false })
    }, [])

    const handelSubForm = useCallback((item?: BaseSubForm) => {
        item ? setInitialSubForm(item) :
            setInitialSubForm({ SFormID: "", SFormName: "", FormID: "", MachineID: "" })
    }, [])

    const handelField = useCallback((item?: FormState) => {
        item ? setInitialField(item) :
            setInitialField({ MCListID: "", CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: "", Required: false, Description: "", Placeholder: "", Hint: "", EResult: "", CListName: "", CTypeName: "", DTypeValue: undefined, MinLength: undefined, MaxLength: undefined })
    }, [])

    const handelSaveSubForm = useCallback((values: BaseSubForm, mode: string) => {

    }, [])

    const handelSaveField = useCallback((values: FormState, mode: string) => {

    }, [])

    const renderField = ({ item, drag, isActive, subFormID }: { item: FormState; drag: () => void; isActive: boolean; subFormID: string }) => {
        return (
            <Animated.View style={{ transform: [{ scale: getScaleValue(subFormID) }] }}>
                <ScaleDecorator>
                    <Pressable
                        onPressIn={() => onPressIn(subFormID)}
                        onPressOut={() => onPressOut(subFormID)}
                        onPress={() => {
                            setEditMode(true);
                            setInitialDialog((v) => ({ ...v, field: true }));
                        }}
                        onLongPress={drag}
                        disabled={isActive}
                        style={[createform.fieldContainer, isActive ? createform.active : null]}
                        testID={`dg-SF-${item.SFormID}`}
                    >
                        <Icon source={checkListType.find((v) => v.CTypeID === item.CTypeID)?.Icon} size={20} />
                        <Text style={createform.fieldText}>{item.CListName}</Text>
                        <Icon source="chevron-right" size={18} />
                    </Pressable>
                </ScaleDecorator>
            </Animated.View>
        );
    };

    const renderSubForm = ({ item, drag, isActive }: { item: BaseSubForm; drag: () => void; isActive: boolean; }) => {
        return (
            <Animated.View style={{ transform: [{ scale: getScaleValue(item.SFormID) }] }}>
                <ScaleDecorator>
                    <AccessibleView style={{ marginBottom: 30 }}>
                        <Pressable
                            onPressIn={() => onPressIn(item.SFormID)}
                            onPressOut={() => onPressOut(item.SFormID)}
                            onPress={() => {
                                setEditMode(true);
                                setInitialDialog((v) => ({ ...v, subform: true }));
                            }}
                            onLongPress={drag}
                            disabled={isActive}
                            style={[createform.subFormContainer, isActive ? createform.active : null]}
                            testID={`dg-SF-${item.SFormID}`}
                        >
                            <Text style={createform.subFormText}>{item.SFormName}</Text>
                            <Icon source="chevron-right" size={18} />
                        </Pressable>

                        <DraggableFlatList
                            data={item.Fields ?? []}
                            renderItem={({ item, drag, isActive }) => renderField({ item, drag, isActive, subFormID: item.SFormID })}
                            keyExtractor={(item, index) => `SF-${item.SFormID}-${index}`}
                            onDragEnd={({ data }) => dispatch(setDragField({ data }))}
                            showsVerticalScrollIndicator={false}
                            activationDistance={1}
                        />

                        <Pressable
                            onPress={() => {
                                setInitialDialog((v) => ({ ...v, field: true }));
                            }}
                            style={[createform.fieldContainer, { justifyContent: "center", opacity: 5 }]}
                        >
                            <Icon source="plus" size={16} />
                            <Text style={createform.addSubFormText}>Add Field</Text>
                        </Pressable>

                    </AccessibleView>
                </ScaleDecorator>
            </Animated.View>
        );
    };

    return (
        <ScrollView>
            <AccessibleView style={createform.containerL1}>
                <Pressable
                    onPress={() => {
                        setInitialDialog((v) => ({ ...v, subform: true }));
                    }}
                    style={[createform.addSubFormButton]}
                >
                    <Icon source="plus" size={16} />
                    <Text style={createform.addSubFormText}>Add Sub Form</Text>
                </Pressable>

                <DraggableFlatList
                    data={state.subForms}
                    renderItem={renderSubForm}
                    keyExtractor={(item, index) => `SF-${item.SFormID}-${index}`}
                    onDragEnd={({ data }) => dispatch(setDragSubForm({ data }))}
                    showsVerticalScrollIndicator={false}
                    activationDistance={1}
                />

                <Pressable onPress={() => { /* Handle Save Form */ }} style={createform.saveButton}>
                    <Text style={createform.saveButtonText}>Save Form</Text>
                </Pressable>
            </AccessibleView>
        </ScrollView>
    );
};

export default React.memo(CreateFormScreen);