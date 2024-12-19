import React, { useState, useCallback, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import {
    setDragSubForm,
    addSubForm,
    updateSubForm,
    deleteSubForm,
} from "@/slices";
import { AccessibleView, Text } from "@/components";
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
import { spacing } from "@/constants/Spacing";
import Dragfield from "./Dragfield";
import { BaseSubForm, RowItemProps } from '@/typing/form'
import { DragsubformProps } from "@/typing/tag";
import { useToast } from "@/app/contexts/useToast";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import useMasterdataStyles from "@/styles/common/masterdata";

const Dragsubform: React.FC<DragsubformProps> = React.memo(({ state, dispatch, checkListOption, checkListType }) => {
    const [initialDialog, setInitialDialog] = useState<boolean>(false)
    const [initialSubForm, setInitialSubForm] = useState<BaseSubForm>({ SFormID: "", SFormName: "", FormID: "", Number: false, MachineID: "", Fields: [] });
    const [editMode, setEditMode] = useState<boolean>(false)
    const masterdataStyles = useMasterdataStyles()
    const { fontSize } = useRes()
    const { theme } = useTheme()
    const createform = useCreateformStyle();
    const { handleError } = useToast();
    console.log("Dragsubform");

    const handleDropSubForm = (data: Omit<BaseSubForm, 'DisplayOrder'>[]) => {
        dispatch(setDragSubForm({ data }));
    };

    const handelSetDialog = useCallback(() => {
        setEditMode(false)
        setInitialDialog(false)
    }, [])

    const handelSubForm = useCallback((item?: BaseSubForm) => {
        item ? setInitialSubForm(item) :
            setInitialSubForm({ SFormID: "", SFormName: "", FormID: "", Number: false, MachineID: "", Fields: [] })
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
    }, [dispatch, handleError, handelSetDialog]);

    const MemoDragfield = React.memo(Dragfield)

    const onPressEdit = useCallback((item: BaseSubForm) => {
        setEditMode(true);
        setInitialDialog(true);
        handelSubForm(item);
    }, [handelSubForm]);

    const RowItem = React.memo(({ item, drag, isActive }: RowItemProps<BaseSubForm>) => {
        return (
            <>
                <TouchableOpacity
                    onPress={() => onPressEdit(item)}
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        createform.subFormContainer,
                        isActive ? createform.active : null
                    ]}
                    testID={`dg-SF-${item.SFormID}`}
                >
                    <IconButton icon={"credit-card-plus"} iconColor={theme.colors.fff} size={spacing.large} style={createform.icon} animated />
                    <Text style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]} numberOfLines={1} ellipsizeMode="tail">
                        {item.SFormName}
                    </Text>
                    <IconButton icon="chevron-right" iconColor={theme.colors.fff} size={spacing.large} style={createform.icon} animated />
                </TouchableOpacity>

                <AccessibleView name="drag-subform" style={{ paddingTop: 5, paddingBottom: state.subForms.length > 0 ? 40 : 0 }}>
                    <MemoDragfield
                        data={item.Fields ?? []}
                        SFormID={item.SFormID}
                        dispatch={dispatch}
                        checkListOption={checkListOption}
                        checkListType={checkListType}
                    />
                </AccessibleView>
            </>
        );
    })

    const renderSubForm = useCallback((params: RenderItemParams<BaseSubForm>) => {
        return (
            <ShadowDecorator>
                <ScaleDecorator activeScale={0.90}>
                    <RowItem {...params} />
                </ScaleDecorator>
            </ShadowDecorator>
        );
    }, [RowItem]);

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    setInitialDialog(true);
                    handelSubForm();
                }}
                style={[createform.addSubFormButton]}
            >
                <IconButton icon="plus" iconColor={theme.colors.fff} size={spacing.large} style={createform.icon} animated />
                <Text style={[masterdataStyles.textFFF, { marginLeft: 8, paddingVertical: 10 }]}>Add Sub Form</Text>
            </TouchableOpacity>

            <NestableScrollContainer
                style={{
                    paddingHorizontal: fontSize === "large" ? 30 : 25,
                    paddingTop: 5,
                    paddingBottom: state.subForms.length > 0 ? 20 : 0,
                }}
            >
                <NestableDraggableFlatList
                    data={state.subForms}
                    renderItem={renderSubForm}
                    keyExtractor={(item) => item.SFormID}
                    onDragEnd={({ data }) => handleDropSubForm(data)}
                    getItemLayout={(data, index) => ({ length: 60, offset: 60 * index, index })}
                    activationDistance={10}
                />
            </NestableScrollContainer>

            {initialDialog && (
                <SubFormDialog
                    isVisible={initialDialog}
                    setIsVisible={handelSetDialog}
                    isEditing={editMode}
                    initialValues={initialSubForm}
                    saveData={handelSaveSubForm}
                    onDelete={(SFormID: string) => {
                        dispatch(deleteSubForm({ SFormID }));
                        handelSetDialog();
                    }}
                />
            )}

        </>
    )
})

export default Dragsubform
