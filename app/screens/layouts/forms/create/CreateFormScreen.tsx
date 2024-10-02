import React, { useState, useCallback } from "react";
import {
    setDragSubForm,
    setDragField,
    deleteSubForm,
} from "@/slices";
import { Pressable, Text, StyleSheet } from "react-native";
import { useForm } from '@/hooks/custom/useForm';
import { AccessibleView } from "@/components";
import SubFormDialog from "@/components/forms/SubFormDialog";
import { useToast } from "@/app/contexts";
import useMasterdataStyles from "@/styles/common/masterdata";
import DraggableFlatList, {
    ScaleDecorator,
} from "react-native-draggable-flatlist";
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
    const { state, dispatch } = useForm(route);
    const [initialDialog, setInitialDialog] = useState<{ form: boolean, subform: boolean, save: boolean, field: boolean }>({ form: false, subform: false, save: false, field: false })
    const [initialForm, setInitialForm] = useState<BaseForm>({ FormID: "", FormName: "", Description: "", MachineID: "" });
    const [initialSubForm, setInitialSubForm] = useState<BaseSubForm>({ SFormID: "", SFormName: "", FormID: "", MachineID: "" });
    const [initialField, setInitialField] = useState<FormState>({ MCListID: "", CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: "", Required: false, Description: "", Placeholder: "", Hint: "", EResult: "", CListName: "", CTypeName: "", DTypeValue: undefined, MinLength: undefined, MaxLength: undefined });
    const [editMode, setEditMode] = useState<boolean>(false)

    const { showError } = useToast();
    const masterdataStyles = useMasterdataStyles();

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

    const renderField = ({ item, drag, isActive }: { item: FormState; drag: () => void; isActive: boolean; }) => {
        return (
            <ScaleDecorator>
                <Pressable
                    onPress={() => {
                        setEditMode(true)
                        setInitialDialog((v) => ({ ...v, field: true }));
                        handelField(item);
                    }}
                    onLongPress={drag}
                    disabled={isActive}
                    style={[styles.subFormContainer, isActive ? styles.active : null]}
                    testID={`dg-SF-${item.SFormID}`}
                >
                    <Text style={styles.subFormText}>Sub Form: {item.CListName}</Text>
                    <Icon source="chevron-right" size={18} />
                </Pressable>
            </ScaleDecorator>
        )
    };

    const renderSubForm = ({ item, drag, isActive }: { item: BaseSubForm; drag: () => void; isActive: boolean; }) => {
        return (
            <ScaleDecorator>

                <DraggableFlatList
                    data={state.subForms}
                    renderItem={renderField}
                    keyExtractor={(item) => `SF-${item.SFormID}`}
                    onDragEnd={({ data }) => dispatch(setDragField({ data }))}
                    showsVerticalScrollIndicator={false}
                    activationDistance={1}
                />

                <Pressable
                    onPress={() => {
                        setEditMode(true)
                        setInitialDialog((v) => ({ ...v, subform: true }));
                        handelSubForm(item);
                    }}
                    onLongPress={drag}
                    disabled={isActive}
                    style={[styles.subFormContainer, isActive ? styles.active : null]}
                    testID={`dg-SF-${item.SFormID}`}
                >
                    <Text style={styles.subFormText}>Sub Form: {item.SFormName}</Text>
                    <Icon source="chevron-right" size={18} />
                </Pressable>
            </ScaleDecorator>
        )
    };

    return (
        <AccessibleView style={styles.container}>
            <Pressable onPress={() => {
                setInitialDialog((v) => ({ ...v, subform: true }));
                handelSubForm();
            }}>
                <Icon source="plus" size={16} />
                <Text>Add Sub Form</Text>
            </Pressable>

            <DraggableFlatList
                data={state.subForms}
                renderItem={renderSubForm}
                keyExtractor={(item) => `SF-${item.SFormID}`}
                onDragEnd={({ data }) => dispatch(setDragSubForm({ data }))}
                showsVerticalScrollIndicator={false}
                activationDistance={1}
            />

            <Pressable onPress={() => {/* Handle Save Form */ }}>
                <Text>Save Form</Text>
            </Pressable>

            <SubFormDialog
                isVisible={initialDialog.subform}
                setShowDialogs={handelSetDialog}
                editMode={editMode}
                subForm={initialSubForm}
                saveSubForm={handelSaveSubForm}
                onDelete={(values: string) => dispatch(deleteSubForm({ values }))}
            />
        </AccessibleView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: '#fff',
    },
    subFormContainer: {
        padding: 16,
        marginVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    active: {
        backgroundColor: '#d0f0d0',
    },
    subFormText: {
        fontSize: 16,
    },
});

export default React.memo(CreateFormScreen);
