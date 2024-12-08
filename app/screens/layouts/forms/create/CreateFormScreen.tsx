import React, { useState, useCallback, useRef, useMemo } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { Divider, Icon, IconButton } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import useForm from "@/hooks/custom/useForm";
import { AccessibleView, ConfigItemForm, SaveDialog, Text } from "@/components";
import Dragsubform from "./Dragsubform";
import Preview from "@/app/screens/layouts/forms/create/ShowForm";
import { CreateFormProps } from "@/typing/tag";
import { BaseFormState, BaseSubForm } from "@/typing/form";
import { CheckList, Checklist, CheckListType, DataType, GroupCheckListOption } from "@/typing/type";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import { addSubForm, defaultDataForm } from "@/slices";
import DraggableItem from "./DraggableItem";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/stores";
import * as Yup from 'yup';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { Field } from "formik";

const { width } = Dimensions.get('window');

const CreateFormScreen: React.FC<CreateFormProps> = React.memo(({ route, navigation }) => {
    const { responsive, fontSize, spacing } = useRes();

    const DRAWER_WIDTH = responsive === "small" ? width : fontSize === "large" ? 500 : 400;

    const translateX = useSharedValue(-DRAWER_WIDTH);
    const mainTranslateX = useSharedValue(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerContent, setDrawerContent] = useState(null);
    const [initialSaveDialog, setInitialSaveDialog] = useState(false);

    const handleSaveDialog = useCallback(() => {
        setInitialSaveDialog(false);
    }, []);

    const { checkList, groupCheckListOption, checkListType, dataType, isLoading } = useForm(route);
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: any) => state.form);
    const [edit, setEdit] = useState<{ [key: string]: boolean }>({
        FormName: false,
        Description: false,
    });

    const openDrawer = (content: any) => {
        setDrawerContent(content);
        translateX.value = withTiming(0, { duration: 300 });
        mainTranslateX.value = withTiming(DRAWER_WIDTH, { duration: 300 });
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 });
        mainTranslateX.value = withTiming(0, { duration: 300 });
        setDrawerOpen(false);
        setDrawerContent(null);
    };

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const mainContentStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: mainTranslateX.value }],
    }));

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            const newValue = Math.max(-DRAWER_WIDTH, Math.min(0, translateX.value + event.translationX));
            translateX.value = newValue;
            mainTranslateX.value = Math.max(0, DRAWER_WIDTH + newValue);
        })
        .onEnd(() => {
            if (translateX.value > -DRAWER_WIDTH / 2) {
                openDrawer(drawerContent || 'main');
            } else {
                closeDrawer();
            }
        });

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

    const childRef = useRef<any>();

    const handleDrop = useCallback((item: CheckList, absoluteX: number, absoluteY: number) => {
        const cardIndex = childRef.current.checkCardPosition(absoluteX, absoluteY);
        const selectedChecklist = checkList.find((v: Checklist) => v.CListID === "CL000") || checkList?.[0];
        const selectedDataType = dataType.find((v: DataType) => item.CTypeTitle === "Number Answer" ? v.DTypeName === "Number" : v.DTypeName === "String") || dataType?.[0];

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
        } else if (item.CTypeName === "SubForm") {
            const subForm = { SFormID: "", SFormName: "New Setion", Columns: 1, Fields: [], FormID: state.FormID || "", MachineID: state.MachineID || "" }
            dispatch(addSubForm({ subForm: subForm }));
        }

    }, [checkList, dataType, groupCheckListOption, state.subForms, dispatch]);

    const createform = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles();
    const { theme } = useTheme();

    const MemoDragsubform = React.memo(Dragsubform)
    const MemoConfigItemForm = React.memo(ConfigItemForm)
    const MemoDraggableItem = React.memo(DraggableItem)
    const MemoSaveDialog = React.memo(SaveDialog)

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        content: {
            flex: 1,
            backgroundColor: theme.colors.background,
            borderLeftWidth: 1,
            borderColor: '#eaeaea',
        },
        buttonContainer: {
            flexDirection: 'row',
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 6
        },
        openButton: {
            backgroundColor: theme.colors.drag,
            alignItems: 'center',
            flexDirection: 'row',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
        },
        openButtonActive: {
            backgroundColor: theme.colors.error,
            alignItems: 'center',
            flexDirection: 'row',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
        },
        drawer: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: DRAWER_WIDTH,
        },
        groupContainer: {
            marginVertical: 20,
            paddingBottom: 10,
        },
        groupTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            textAlign: 'center',
        },
        fieldList: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
        },
        fieldContainer: {
            marginHorizontal: 10,
            flex: 1,
        },
        iconButton: {
            marginBottom: 5,
        },
        fieldTitle: {
            textAlign: 'center',
            color: 'black',
            fontSize: 12,
        },
    });

    return (
        <GestureHandlerRootView style={[createform.container, { flex: 1 }]}>
            <AccessibleView name="container-create-form" style={styles.container}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        style={[
                            styles.content,
                            mainContentStyle,
                            { width: drawerOpen ? width - DRAWER_WIDTH : width },
                        ]}
                    >
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={() => !drawerOpen || drawerContent !== "main" ? openDrawer('main') : closeDrawer()}
                                style={!drawerOpen || drawerContent !== "main" ? styles.openButton : styles.openButtonActive}
                            >
                                <Icon source={"format-list-bulleted"} size={spacing.large} color={theme.colors.fff} key={"icon-tool"} />
                                <Text style={[masterdataStyles.text, masterdataStyles.textFFF, { marginLeft: 10, padding: 2 }]}>FormDetail</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => !drawerOpen || drawerContent !== "toolbox" ? openDrawer('toolbox') : closeDrawer()}
                                style={!drawerOpen || drawerContent !== "toolbox" ? styles.openButton : styles.openButtonActive}
                            >
                                <Icon source={"tools"} size={spacing.large} color={theme.colors.fff} key={"icon-tool"} />
                                <Text style={[masterdataStyles.text, masterdataStyles.textFFF, { marginLeft: 10, padding: 2 }]}>ToolBar</Text>
                            </TouchableOpacity>
                        </View>

                        <AccessibleView name="container-preview" style={[createform.containerL2, { marginTop: 80, marginHorizontal: 10 }]}>
                            <Preview
                                route={route}
                                ref={childRef}
                                validationSchema={validationSchema}
                                groupCheckListOption={groupCheckListOption}
                                dataType={dataType}
                                isLoading={isLoading}
                            />
                        </AccessibleView>

                    </Animated.View>
                </GestureDetector>

                <Animated.View style={[styles.drawer, drawerStyle]}>
                    {drawerContent === 'main' && drawerContent && (
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

                    {drawerContent === 'toolbox' && (
                        <ScrollView
                            style={{ display: drawerContent === "toolbox" ? 'flex' : 'none', marginTop: 20 }}
                            showsVerticalScrollIndicator={false}
                        >
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

                            <View style={styles.groupContainer}>

                                {checkListType && checkListType.length > 0 ? checkListType.map((item: CheckListType, index) => (
                                    item.IsActive && (
                                        <View key={index}>
                                            <View style={styles.fieldContainer}>
                                                <Text style={masterdataStyles.text}>{item.GTypeName}</Text>

                                                <Divider bold style={[{ marginVertical: 10, height: 1, backgroundColor: theme.colors.onBackground }]} />

                                                <MemoDraggableItem data={item?.CheckList || []} key={`drag-${index}`} onDrop={handleDrop} />
                                                {item.CheckList && <Divider bold style={[{ marginVertical: 10, height: 1, backgroundColor: theme.colors.onBackground }]} />}
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
