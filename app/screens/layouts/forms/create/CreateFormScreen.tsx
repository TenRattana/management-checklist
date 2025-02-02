import React, { useState, useCallback, useRef, useMemo } from "react";
import { useWindowDimensions, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { Divider, Icon } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import useForm from "@/hooks/custom/useForm";
import { ConfigItemForm, FieldDialog, SaveDialog, SubFormDialog, Text } from "@/components";
import Dragsubform from "./Dragsubform";
import Preview from "@/app/screens/layouts/forms/create/ShowForm";
import { BaseFormState, BaseSubForm } from "@/typing/form";
import { DataType } from "@/typing/type";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import { addSubForm, defaultDataForm, deleteField, deleteSubForm, updateSubForm } from "@/slices";
import DraggableItem from "./DraggableItem";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/stores";
import * as Yup from 'yup';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import Create from "@/styles/Create";
import { useToast } from "@/app/contexts/useToast";
import { CreateFormProps } from "@/typing/screens/CreateForm";
import { CheckListType, GroupCheckListType } from "@/typing/screens/CheckList";

const isValidDateFormatCustom = (value: string) => {
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;
    return dateRegex.test(value);
};

const CreateFormScreen = React.memo(({ route }: CreateFormProps) => {
    const { responsive, fontSize, spacing } = useRes();
    const { handleError } = useToast();
    const { width } = useWindowDimensions();
    const DRAWER_WIDTH = responsive === "small" ? width : fontSize === "large" ? 350 : 320;
    const [dialogVisible, setDialogVisible] = useState<{ sub: boolean, field: boolean }>({ sub: false, field: false });

    const translateX = useSharedValue(-DRAWER_WIDTH);
    const mainTranslateX = useSharedValue(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerContent, setDrawerContent] = useState(null);
    const [initialSaveDialog, setInitialSaveDialog] = useState(false);

    const { isLoading, checkList, groupCheckListOption, checkListType, dataType } = useForm(route);
    const styles = Create(width, drawerOpen)

    const checkLists = useMemo(
        () =>
            checkListType
                .filter(group => group.CheckList)
                .flatMap(group => group.CheckList)
                .filter((checkList): checkList is CheckListType => checkList !== undefined),
        [checkListType]
    );

    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: any) => state.form);
    const [edit, setEdit] = useState<{ [key: string]: boolean }>({
        FormName: false,
        Description: false,
    });

    const openDrawer = useCallback((content: any) => {
        setDrawerContent(content);
        translateX.value = withTiming(0, { duration: 300 });
        mainTranslateX.value = withTiming(DRAWER_WIDTH, { duration: 300 });
        setDrawerOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 });
        mainTranslateX.value = withTiming(0, { duration: 300 });
        setDrawerOpen(false);
        setDrawerContent(null);
    }, []);

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const mainContentStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: mainTranslateX.value }],
    }));

    const validationSchemaShow = useMemo(() => {
        const shape: Record<string, any> = {};
        state.subForms.forEach((subForm: BaseSubForm) => {
            subForm.Fields.forEach((field: BaseFormState) => {
                const dataTypeName = dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
                let validator;

                if (dataTypeName === "Number") {
                    validator = Yup.number()
                        .nullable()
                        .typeError(`The ${field.CListName} field must be a valid number`);
                } else if (dataTypeName === "Date") {
                    validator = Yup.string()
                        .nullable()
                        .test('is-valid-date', 'Invalid date format', value => {
                            return value ? isValidDateFormatCustom(String(value)) : true;
                        })
                } else if (field.CTypeName === "Checkbox") {
                    validator = Yup.array()
                        .of(Yup.string().required("Each selected option is required."))
                } else {
                    validator = Yup.string()
                        .nullable()
                        .typeError(`The ${field.CListName} field must be a valid string`);
                }
                if (field.Required) validator = validator.required(`The ${field.CListName} field is required`);

                if (field.Required && field.CTypeName === "Checkbox") {
                    validator = validator.min(1, "You must select at least one option.").required("Important value is required when marked as important.");
                }

                shape[field.MCListID] = validator;
            });
        });
        return Yup.object().shape(shape);
    }, [state.subForms, dataType]);

    const childRef = useRef<any>();

    const handleDrop = useCallback((item: CheckListType, absoluteX: number, absoluteY: number) => {
        const cardIndex = childRef.current.checkCardPosition(absoluteX, absoluteY);
        const selectedChecklist = checkList?.[0];
        const selectedDataType = dataType.find((v: DataType) => item.CTypeTitle === "Number Answer" ? v.DTypeName === "Number" : item.CTypeTitle === "Time/Date" ? v.DTypeName === "Date" : v.DTypeName === "String") || dataType?.[0];

        if (item.CTypeName === "SubForm") {
            const subForm = { SFormID: "", SFormName: "New Setion", Columns: 1, Fields: [], Number: false, FormID: state.FormID || "", MachineID: state.MachineID || "" }
            runOnJS(dispatch)(addSubForm({ subForm: subForm }));
        } else if (cardIndex >= 0) {
            const targetSubForm = state.subForms[cardIndex];
            const idMcl = `MCL-ADD-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
            const newField: BaseFormState = {
                MCListID: idMcl,
                CListID: selectedChecklist?.CListID ?? "",
                GCLOptionID: ["Dropdown", "Radio", "Checkbox"].includes(item.CTypeName)
                    ? groupCheckListOption?.[0]?.GCLOptionID
                    : undefined,
                CTypeID: item.CTypeID,
                DTypeID: selectedDataType?.DTypeID ?? "",
                SFormID: targetSubForm.SFormID,
                Required: false,
                Important: false,
                Rowcolumn: 1,
                ImportantList: [{
                    MCListID: idMcl,
                    Value: [],
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
                GCLOptionName: groupCheckListOption?.[0]?.GCLOptionName
            };

            runOnJS(dispatch)(defaultDataForm({ currentField: newField }));
        }

    }, [checkList, dataType, groupCheckListOption, state.subForms, dispatch]);

    const createform = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles();
    const { theme } = useTheme();

    const MemoSubFormDialog = React.memo(SubFormDialog)
    const MemoDragsubform = React.memo(Dragsubform)
    const MemoConfigItemForm = React.memo(ConfigItemForm)
    const MemoDraggableItem = React.memo(DraggableItem)
    const MemoSaveDialog = React.memo(SaveDialog)

    const [currentSub, setCurrentSub] = useState<BaseSubForm>({ SFormID: "", SFormName: "", FormID: "", Number: false, MachineID: "", Fields: [] });
    const [currentField, setCurrentField] = useState<BaseFormState>({
        MCListID: "", CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: "",
        Required: false, Important: false, ImportantList: [], EResult: "", CListName: "", DTypeValue: undefined,
    });

    const handleSaveDialog = useCallback(() => {
        setInitialSaveDialog(false);
        handleDialogToggle("field", false)
    }, []);


    const showField = useCallback(async (mclo: string, sform: string) => {
        if (mclo && sform) {
            const data = await state.subForms
                ?.find((v: BaseSubForm) => v.SFormID === sform)
                ?.Fields?.find((v: BaseFormState) => String(v.MCListID) === mclo);

            setCurrentField(data)
            handleDialogToggle("field", true)
        } else if (mclo === undefined && sform) {
            const data = await state.subForms
                ?.find((v: BaseSubForm) => v.SFormID === sform)
            setCurrentSub(data)
            handleDialogToggle("sub", true)
        }
    }, [state.subForms])

    const handelSaveSubForm = useCallback((values: BaseSubForm, mode: string) => {
        const payload = { subForm: values };

        try {
            if (mode === "update") {
                dispatch(updateSubForm(payload));
            }
        } catch (error) {
            handleError(error)
        } finally {
            handleDialogToggle("sub", false)
        }
    }, [dispatch]);

    const handleDialogToggle = useCallback((field: string, value: boolean) => {
        setDialogVisible((prev) => ({ ...prev, [field]: value }));
    }, []);

    const MemoFieldDialog = React.memo(FieldDialog)

    return (
        <GestureHandlerRootView style={[createform.container, { flex: 1 }]}>
            <View id="container-create-form" style={styles.container}>
                <Animated.View
                    style={[
                        styles.content,
                        mainContentStyle,
                    ]}
                >
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={() => !drawerOpen || drawerContent !== "main" ? runOnJS(openDrawer)('main') : closeDrawer()}
                            style={!drawerOpen || drawerContent !== "main" ? styles.openButton : styles.openButtonActive}
                        >
                            <Icon source={"format-list-bulleted"} size={spacing.large} color={theme.colors.fff} key={"icon-tool"} />
                            <Text style={[masterdataStyles.text, masterdataStyles.textFFF, { marginLeft: 10, padding: 2 }]}>FormDetail</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => !drawerOpen || drawerContent !== "toolbox" ? runOnJS(openDrawer)('toolbox') : closeDrawer()}
                            style={!drawerOpen || drawerContent !== "toolbox" ? styles.openButton : styles.openButtonActive}
                        >
                            <Icon source={"tools"} size={spacing.large} color={theme.colors.fff} key={"icon-tool"} />
                            <Text style={[masterdataStyles.text, masterdataStyles.textFFF, { marginLeft: 10, padding: 2 }]}>ToolBar</Text>
                        </TouchableOpacity>
                    </View>

                    <View id="container-preview" style={[createform.containerL2, { marginTop: 40, marginHorizontal: 10 }]}>
                        <Preview
                            route={route}
                            ref={childRef}
                            validationSchema={validationSchemaShow}
                            dataType={dataType}
                            showField={showField}
                            isLoading={isLoading}
                        />
                    </View>
                </Animated.View>

                {drawerOpen && (
                    <Animated.View style={[styles.drawer, drawerStyle]}>
                        {drawerContent === 'main' && drawerContent && (
                            <>
                                {responsive === "small" && (
                                    <TouchableOpacity
                                        onPress={() => closeDrawer()}
                                        style={[styles.openButtonActive, { marginHorizontal: 16, marginTop: 20 }]}
                                    >
                                        <Icon source={"arrow-left-circle"} size={spacing.large} color={theme.colors.fff} key={"icon-tool"} />
                                        <Text style={[masterdataStyles.text, masterdataStyles.textFFF, { marginLeft: 10, padding: 2 }]}>Close Drawer</Text>
                                    </TouchableOpacity>
                                )}

                                <MemoDragsubform
                                    checkLists={checkLists}
                                />
                            </>
                        )}

                        {drawerContent === 'toolbox' && (
                            <ScrollView
                                style={{ display: drawerContent === "toolbox" ? 'flex' : 'none', marginTop: 10, marginHorizontal: responsive === "small" ? "5%" : 0 }}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={{ paddingHorizontal: 5 }}>
                                    <Text style={[masterdataStyles.menuText, masterdataStyles.title, { paddingLeft: 20 }]}>Detail Form</Text>
                                </View>

                                <Divider style={{ marginHorizontal: 20, }} />

                                {responsive === "small" && (
                                    <TouchableOpacity
                                        onPress={() => closeDrawer()}
                                        style={[styles.openButtonActive, { marginHorizontal: 16 }]}
                                    >
                                        <Icon source={"arrow-left-circle"} size={spacing.large} color={theme.colors.fff} key={"icon-tool"} />
                                        <Text style={[masterdataStyles.text, masterdataStyles.textFFF, { marginLeft: 10, padding: 2 }]}>Close Drawer</Text>
                                    </TouchableOpacity>
                                )}

                                <View id="container-formname" style={{ marginHorizontal: 10, marginTop: 5 }}>
                                    {['FormName', 'Description', 'FormNumber'].map((item) => (
                                        <MemoConfigItemForm
                                            key={item}
                                            label={item}
                                            value={state[item]}
                                            editable={edit[item]}
                                            onEdit={(v: boolean) => setEdit(prev => ({ ...prev, [item]: v }))} />
                                    ))}
                                </View>

                                <TouchableOpacity
                                    onPress={() => setInitialSaveDialog(true)}
                                    style={[createform.saveButton, { justifyContent: "center" }]}
                                >
                                    <Text style={masterdataStyles.textFFF}>Save Form</Text>
                                </TouchableOpacity>

                                <View style={[styles.groupContainer, { paddingVertical: 10 }]}>
                                    {checkListType && checkListType.length > 0 ? checkListType.map((item: GroupCheckListType, index) => (
                                        item.IsActive && (
                                            <View key={index}>
                                                <View style={styles.fieldContainer}>
                                                    <Text style={[masterdataStyles.text, { paddingLeft: 20 }]}>{item.GTypeName}</Text>

                                                    <Divider bold style={[{ marginVertical: 10, marginHorizontal: 20 }]} />

                                                    <MemoDraggableItem data={item?.CheckList || []} key={`drag-${index}`} onDrop={handleDrop} />
                                                </View>
                                            </View>
                                        )
                                    )) : (
                                        <Text style={masterdataStyles.text}>No Fields Available</Text>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </Animated.View>
                )}
            </View>

            {dialogVisible.sub && (
                <MemoSubFormDialog
                    isVisible={dialogVisible.sub}
                    setIsVisible={() => handleDialogToggle("sub", false)}
                    isEditing={true}
                    initialValues={currentSub}
                    saveData={handelSaveSubForm}
                    onDelete={(SFormID: string) => {
                        dispatch(deleteSubForm({ SFormID }));
                        handleDialogToggle("sub", false)
                    }}
                />
            )}

            {dialogVisible.field && (
                <MemoFieldDialog
                    isVisible={dialogVisible.field}
                    formState={currentField}
                    onDeleteField={(SFormID, MCListID) => dispatch(deleteField({ SFormID, MCListID }))}
                    setShowDialogs={() => handleDialogToggle("field", false)}
                    editMode={true}
                />
            )}

            {initialSaveDialog && (
                <MemoSaveDialog
                    state={state}
                    isVisible={initialSaveDialog}
                    setIsVisible={handleSaveDialog}
                />
            )}

        </GestureHandlerRootView>
    );
});


export default CreateFormScreen;
