import React, { useState, useCallback } from "react";
import {
    Pressable,
} from "react-native";
import {
    setDragSubForm,
    addSubForm,
    updateSubForm,
    deleteSubForm,
} from "@/slices";
import { AccessibleView, SaveDialog, Text } from "@/components";
import SubFormDialog from "@/components/forms/SubFormDialog";
import useCreateformStyle from "@/styles/createform";
import {
    RenderItemParams,
    ScaleDecorator,
    NestableScrollContainer,
    NestableDraggableFlatList,
    ShadowDecorator
} from "react-native-draggable-flatlist";
import { IconButton } from "react-native-paper";
import { runOnJS } from "react-native-reanimated";
import { spacing } from "@/constants/Spacing";
import Dragfield from "./Dragfield";
import { BaseSubForm, RowItemProps } from '@/typing/form'
import { DragsubformProps } from "@/typing/tag";
import { useToast } from "@/app/contexts";

const Dragsubform: React.FC<DragsubformProps> = ({ state, dispatch, dataType, checkListType, groupCheckListOption, checkList, navigation }) => {
    const [initialDialog, setInitialDialog] = useState<boolean>(false)
    const [initialSubForm, setInitialSubForm] = useState<BaseSubForm>({ SFormID: "", SFormName: "", FormID: "", MachineID: "", Fields: [] });
    const [editMode, setEditMode] = useState<boolean>(false)
    const createformStyles = useCreateformStyle();

    const createform = useCreateformStyle();
    const { handleError } = useToast();

    const handleDropSubForm = (data: Omit<BaseSubForm, 'DisplayOrder'>[]) => {
        runOnJS(dispatch)(setDragSubForm({ data }));
    };

    const handelSetDialog = useCallback(() => {
        setEditMode(false)
        setInitialDialog(false)
    }, [])

    const handelSubForm = useCallback((item?: BaseSubForm) => {
        item ? setInitialSubForm(item) :
            setInitialSubForm({ SFormID: "", SFormName: "", FormID: "", MachineID: "", Fields: [] })
    }, [])

    const handelSaveSubForm = useCallback((values: BaseSubForm, mode: string) => {
        const payload = { subForm: values };

        try {
            if (mode === "add") {
                dispatch(addSubForm(payload));
            } else if (mode === "update") {
                dispatch(updateSubForm(payload));
            }
        } catch (error) {
            handleError(error)
        } finally {
            handelSetDialog()
        }
    }, [])

    const RowItem = ({ item, drag, isActive }: RowItemProps<BaseSubForm>) => {
        return (
            <>
                <Pressable
                    onPress={() => {
                        setEditMode(true);
                        setInitialDialog(true);
                        handelSubForm(item);
                    }}
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        createform.subFormContainer,
                        isActive ? createform.active : null
                    ]}
                    testID={`dg-SF-${item.SFormID}`}
                >
                    <IconButton icon={"credit-card-plus"} size={spacing.large} animated style={createformStyles.icon} />
                    <Text style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                        {item.SFormName}
                    </Text>
                    <IconButton icon="chevron-right" size={18} />
                </Pressable>

                <AccessibleView name="drag-subform" style={{ paddingTop: 5, paddingBottom: state.subForms.length > 0 ? 40 : 0 }}>
                    <Dragfield
                        data={item.Fields ?? []}
                        SFormID={item.SFormID}
                        dispatch={dispatch}
                        checkList={checkList}
                        dataType={dataType}
                        checkListType={checkListType}
                        groupCheckListOption={groupCheckListOption}
                    />
                </AccessibleView>
            </>

        );
    }

    const renderSubForm = useCallback((params: RenderItemParams<BaseSubForm>) => {
        return (
            <ShadowDecorator>
                <ScaleDecorator activeScale={0.98}>
                    <RowItem {...params} />
                </ScaleDecorator>
            </ShadowDecorator>
        );
    }, []);

    return (
        <>
            <Pressable
                onPress={() => {
                    setInitialDialog(true);
                    handelSubForm();
                }}
                style={[createform.addSubFormButton]}
            >
                <IconButton icon="plus" size={spacing.large} style={createformStyles.icon} />
                <Text style={createform.addSubFormText}>Add Sub Form</Text>
            </Pressable>

            <NestableScrollContainer>
                <AccessibleView name="drag-subform" style={{ paddingHorizontal: 30, paddingTop: 5, paddingBottom: state.subForms.length > 0 ? 40 : 0 }}>
                    <NestableDraggableFlatList
                        data={state.subForms}
                        renderItem={renderSubForm}
                        keyExtractor={(item, index) => `SF-${item.SFormID}-${index}`}
                        onDragEnd={({ data }) => handleDropSubForm(data)}
                        activationDistance={1}
                    />
                </AccessibleView>
            </NestableScrollContainer>

            <SubFormDialog
                isVisible={initialDialog}
                setIsVisible={handelSetDialog}
                isEditing={editMode}
                initialValues={initialSubForm}
                saveData={handelSaveSubForm}
                onDelete={(SFormID: string) => dispatch(deleteSubForm({ SFormID }))}
            />
        </>

    )
}

export default React.memo(Dragsubform)
