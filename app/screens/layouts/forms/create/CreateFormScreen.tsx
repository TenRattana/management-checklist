import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Pressable, FlatList, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Divider } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import useForm from "@/hooks/custom/useForm";
import { AccessibleView, ConfigItemForm, SaveDialog, Text } from "@/components";
import Dragsubform from "./Dragsubform";
import Preview from "@/app/screens/layouts/forms/view/Preview";
import { CreateFormProps } from "@/typing/tag";
import { BaseForm, BaseFormState } from "@/typing/form";
import { Checklist, CheckListType, DataType, GroupCheckListOption, Machine } from "@/typing/type";
import { useRes, useTheme } from "@/app/contexts";
import { defaultDataForm } from "@/slices";
import DraggableItem from "./DraggableItem";

const CreateFormScreen: React.FC<CreateFormProps> = React.memo(({ route, navigation }) => {
    const { state, dispatch, checkList, groupCheckListOption, checkListType, dataType, validationSchema, isLoading } = useForm(route);
    const createform = useCreateformStyle();
    const { theme } = useTheme();
    const { spacing } = useRes();
    const masterdataStyles = useMasterdataStyles();
    const [edit, setEdit] = useState<{ [key: string]: boolean }>({
        FormName: false,
        Description: false,
    });

    const [initialSaveDialog, setInitialSaveDialog] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const formRef = useRef<BaseForm>({ FormID: "", FormName: "", Description: "", MachineID: "" });

    const newForm = useMemo(() => ({
        FormID: state.FormID || "",
        FormName: state.FormName || "",
        Description: state.Description || "",
        MachineID: state.MachineID || "",
    }), [state]);

    useEffect(() => {
        formRef.current = newForm;
    }, [newForm]);

    const handleSaveDialog = useCallback(() => {
        setInitialSaveDialog(false);
    }, []);
    const childRef = useRef<any>();

    const handleDrop = (item: CheckListType, absoluteX: number, absoluteY: number) => {
        const cardIndex = childRef.current.checkCardPosition(absoluteX, absoluteY);
        const selectedChecklist = checkList.find((v: Checklist) => v.CListID === "CL000") || checkList?.[0];
        const selectedDataType = dataType.find((v: DataType) => v.DTypeName === "String") || dataType?.[0];


        if (cardIndex >= 0) {
            const targetSubForm = state.subForms[cardIndex];
            const newField: BaseFormState = {
                MCListID: `MCL-ADD-${Math.random()}`,
                CListID: selectedChecklist?.CListID ?? "",
                GCLOptionID: ["Dropdown", "Radio", "Checkbox"].includes(item.CTypeName)
                    ? (groupCheckListOption.find((v: GroupCheckListOption) => v.GCLOptionID === "GCLO000") || groupCheckListOption?.[0])?.GCLOptionID
                    : undefined,
                CTypeID: item.CTypeID,
                DTypeID: selectedDataType?.DTypeID ?? "",
                SFormID: targetSubForm.SFormID,
                Required: false,
                Placeholder: "Empty content",
                Hint: "Empty content",
                EResult: "",
                CListName: selectedChecklist?.CListName ?? "",
                CTypeName: item.CTypeName,
                DTypeValue: undefined,
                MinLength: undefined,
                MaxLength: undefined
            };

            dispatch(defaultDataForm({ currentField: newField }));
        }
    };

    const renderItem = () => {
        if (selectedIndex === 0) {
            return (
                <>
                    <AccessibleView name="container-formname" style={{ marginHorizontal: 10, marginTop: 20 }}>
                        {['FormName', 'Description'].map((item) => (
                            <ConfigItemForm
                                key={item}
                                label={item}
                                value={state[item]}
                                editable={edit[item]}
                                onEdit={(v: boolean) => setEdit(prev => ({ ...prev, [item]: v }))}
                            />
                        ))}
                    </AccessibleView>

                    <Pressable
                        onPress={() => setInitialSaveDialog(true)}
                        style={[createform.saveButton, { justifyContent: "center" }]}
                    >
                        <Text style={masterdataStyles.textFFF}>Save Form</Text>
                    </Pressable>
                </>
            );
        }
        return null;
    }

    return (
        <GestureHandlerRootView style={[createform.container, { flex: 1 }]}>
            <AccessibleView name="container-form" style={[createform.containerL1]}>
                <SegmentedControl
                    values={["Tool", "Form"]}
                    selectedIndex={selectedIndex}
                    onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
                    style={{ height: 80, borderRadius: 0 }}
                    fontStyle={{ fontSize: spacing.small }}
                    activeFontStyle={{ fontWeight: "bold" }}
                />

                <FlatList
                    data={selectedIndex === 0 ? [1] : []}
                    renderItem={() => renderItem()}
                    keyExtractor={(index) => `unique-key-${index}`}
                    style={{ display: selectedIndex === 0 ? 'flex' : 'none' }}
                    contentContainerStyle={{ flexGrow: selectedIndex === 0 ? 1 : undefined }}
                    ListFooterComponentStyle={{ paddingHorizontal: 20 }}
                    ListFooterComponent={() => (
                        <>
                            <Divider bold style={[{ marginVertical: 10, height: 2, backgroundColor: theme.colors.onBackground }]} />
                            <Text style={[masterdataStyles.title, { textAlign: 'center', color: theme.colors.onBackground }]}>Menu List Type</Text>

                            {Array.isArray(checkListType) && checkListType.length > 0 ? (
                                checkListType.map((item: CheckListType, index: number) => (
                                    <DraggableItem item={item} onDrop={handleDrop} key={`${item.CTypeID}-${index}`} />
                                ))
                            ) : (
                                <Text style={{ textAlign: 'center', color: theme.colors.onBackground }}>No items available</Text>
                            )}
                        </>
                    )}
                />

                {selectedIndex === 1 && (
                    <Dragsubform
                        navigation={navigation}
                        state={state}
                        dispatch={dispatch}
                        checkList={checkList ?? []}
                        dataType={dataType ?? []}
                        checkListType={checkListType ?? []}
                        groupCheckListOption={groupCheckListOption ?? []}
                        selectedIndex={selectedIndex}
                    />
                )}

            </AccessibleView>

            <AccessibleView name="container-preview" style={[createform.containerL2]}>
                <Preview
                    route={route}
                    ref={childRef}
                    validationSchema={validationSchema}
                />
            </AccessibleView>

            <SaveDialog
                state={state}
                isVisible={initialSaveDialog}
                setIsVisible={handleSaveDialog}
                navigation={navigation}
            />
        </GestureHandlerRootView>
    );
});

export default CreateFormScreen;
