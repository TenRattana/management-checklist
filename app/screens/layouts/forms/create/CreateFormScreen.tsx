import React, { useState, useCallback, useRef, useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import SegmentedControl from "@/components/screens/SegmentedControl";
import { Divider } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import useForm from "@/hooks/custom/useForm";
import { AccessibleView, ConfigItemForm, SaveDialog, Text } from "@/components";
import Dragsubform from "./Dragsubform";
import Preview from "@/app/screens/layouts/forms/create/ShowForm";
import { CreateFormProps } from "@/typing/tag";
import { BaseFormState, BaseSubForm } from "@/typing/form";
import { Checklist, CheckListType, DataType, GroupCheckListOption } from "@/typing/type";
import { useTheme } from "@/app/contexts/useTheme";
import { defaultDataForm } from "@/slices";
import DraggableItem from "./DraggableItem";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/stores";
import * as Yup from 'yup';

const options = ["Tool", "Form"]

const CreateFormScreen: React.FC<CreateFormProps> = React.memo(({ route, navigation }) => {

    const { checkList, groupCheckListOption, checkListType, dataType, isLoading } = useForm(route);
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: any) => state.form);

    const validationSchema = useMemo(() => {

        const shape: Record<string, any> = {};
        state.subForms.forEach((subForm: BaseSubForm) => {
            subForm.Fields.forEach((field: BaseFormState) => {
                const dataTypeName = dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
                let validator;
                if (dataTypeName === "Number") {
                    validator = Yup.number()
                        .nullable()
                        .typeError(`The ${field.CListName} field must be a valid number`);
                } else {
                    validator = Yup.string()
                        .nullable()
                        .typeError(`The ${field.CListName} field must be a valid string`);
                }
                if (field.Required) validator = validator.required(`The ${field.CListName} field is required`);
                shape[field.MCListID] = validator;
            });
        });
        return Yup.object().shape(shape);
    }, [state.subForms, dataType]);

    const createform = useCreateformStyle();
    const { theme } = useTheme();

    const masterdataStyles = useMasterdataStyles();
    const [edit, setEdit] = useState<{ [key: string]: boolean }>({
        FormName: false,
        Description: false,
    });

    const [initialSaveDialog, setInitialSaveDialog] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<string>("Tool");

    const handleSaveDialog = useCallback(() => {
        setInitialSaveDialog(false);
    }, []);

    const childRef = useRef<any>();

    const handleDrop = useCallback((item: CheckListType, absoluteX: number, absoluteY: number) => {
        const cardIndex = childRef.current.checkCardPosition(absoluteX, absoluteY);
        const selectedChecklist = checkList.find((v: Checklist) => v.CListID === "CL000") || checkList?.[0];
        const selectedDataType = dataType.find((v: DataType) => v.DTypeName === "String") || dataType?.[0];

        if (cardIndex >= 0) {
            const targetSubForm = state.subForms[cardIndex];
            const idMcl = `MCL-ADD-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
            const newField: BaseFormState = {
                MCListID: idMcl,
                CListID: selectedChecklist?.CListID ?? "",
                GCLOptionID: ["Dropdown", "Radio", "Checkbox"].includes(item.CTypeName)
                    ? (groupCheckListOption.find((v: GroupCheckListOption) => v.GCLOptionID === "GCLO000") || groupCheckListOption?.[0])?.GCLOptionID
                    : undefined,
                CTypeID: item.CTypeID,
                DTypeID: selectedDataType?.DTypeID ?? "",
                SFormID: targetSubForm.SFormID,
                Required: false,
                Important: false,
                ImportantList: [{
                    MCListID: idMcl,
                    Value: undefined,
                    MinLength: undefined,
                    MaxLength: undefined
                }],
                Placeholder: "Empty content",
                Hint: "Empty content",
                EResult: "",
                CListName: selectedChecklist?.CListName ?? "",
                CTypeName: item.CTypeName,
                DTypeValue: undefined,
                DTypeName: selectedDataType?.DTypeName ?? "",
            };

            dispatch(defaultDataForm({ currentField: newField }));
        }
    }, [checkList, dataType, groupCheckListOption, state.subForms, dispatch]);

    const handleSegmentChange = useCallback((option: string) => {
        setSelectedIndex(option)
    }, [])

    const MemoDragsubform = React.memo(Dragsubform)
    const MemoConfigItemForm = React.memo(ConfigItemForm)
    const MemoSegmentedControl = React.memo(SegmentedControl)
    const MemoDraggableItem = React.memo(DraggableItem)
    const MemoSaveDialog = React.memo(SaveDialog)

    return (
        <GestureHandlerRootView style={[createform.container, { flex: 1 }]}>
            <AccessibleView name="container-form" style={[createform.containerL1]}>

                <MemoSegmentedControl
                    options={options}
                    selectedOption={selectedIndex}
                    onOptionPress={handleSegmentChange}
                />

                <ScrollView style={{ display: selectedIndex === "Tool" ? 'flex' : 'none' }}>
                    <AccessibleView name="container-formname" style={{ marginHorizontal: 10, marginTop: 5 }}>
                        {['FormName', 'Description'].map((item) => (
                            <MemoConfigItemForm
                                key={item}
                                label={item}
                                value={state[item]}
                                editable={edit[item]}
                                onEdit={(v: boolean) => setEdit(prev => ({ ...prev, [item]: v }))} />
                        ))}
                    </AccessibleView>

                    <TouchableOpacity
                        onPress={() => setInitialSaveDialog(true)}
                        style={[createform.saveButton, { justifyContent: "center" }]}
                    >
                        <Text style={masterdataStyles.textFFF}>Save Form</Text>
                    </TouchableOpacity>

                    <Divider bold style={[{ marginVertical: 10, height: 2, backgroundColor: theme.colors.onBackground }]} />
                    <Text style={[masterdataStyles.title, { textAlign: 'center', color: theme.colors.onBackground }]}>Menu List Type</Text>

                    {Array.isArray(checkListType) && checkListType.length > 0 ? (
                        checkListType.map((item: CheckListType, index: number) => (
                            <MemoDraggableItem item={item} onDrop={handleDrop} key={`${item.CTypeID}-${index}`} />
                        ))
                    ) : (
                        <Text>No Data</Text>
                    )}
                </ScrollView>

                {selectedIndex === "Form" && (
                    <MemoDragsubform
                        navigation={navigation}
                        state={state}
                        dispatch={dispatch}
                        checkList={checkList ?? []}
                        dataType={dataType ?? []}
                        checkListType={checkListType ?? []}
                        groupCheckListOption={groupCheckListOption ?? []}
                    />
                )}

            </AccessibleView>

            <AccessibleView name="container-preview" style={[createform.containerL2]}>
                <Preview
                    route={route}
                    ref={childRef}
                    validationSchema={validationSchema}
                    groupCheckListOption={groupCheckListOption}
                    dataType={dataType}
                    isLoading={isLoading}
                />
            </AccessibleView>

            <MemoSaveDialog
                state={state}
                isVisible={initialSaveDialog}
                setIsVisible={handleSaveDialog}
                navigation={navigation}
            />
        </GestureHandlerRootView>
    );
});

export default CreateFormScreen;
