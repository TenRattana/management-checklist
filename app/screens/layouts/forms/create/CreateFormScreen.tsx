import React, { useState, useEffect, useCallback, useRef, useMemo, useImperativeHandle } from "react";
import { Dimensions, Pressable, View, PanResponder, FlatList, ViewStyle, Animated, ScrollView } from "react-native";
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { IconButton, Divider, HelperText, Card, Portal } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import useForm from "@/hooks/custom/useForm";
import { AccessibleView, Inputs, SaveDialog, Text } from "@/components";
import Dragsubform from "./Dragsubform";
import Preview from "@/app/screens/layouts/forms/view/Preview";
import { CreateFormProps } from "@/typing/tag";
import { BaseForm, BaseFormState, BaseSubForm } from "@/typing/form";
import { updateForm } from "@/slices";
import { CheckListType } from "@/typing/type";
import { useRes, useToast } from "@/app/contexts";
import { defaultDataForm } from "@/slices";
import * as Yup from 'yup';
import DraggableItem from "./DraggableItem";

interface FormValues {
    [key: string]: any;
}

const CreateFormScreen: React.FC<CreateFormProps> = ({ route, navigation }) => {
    const { state, dispatch, checkList, groupCheckListOption, checkListType, dataType } = useForm(route);
    const createform = useCreateformStyle();

    const [count, setCount] = useState<number>(0)

    const { handleError } = useToast()
    const masterdataStyles = useMasterdataStyles();
    const createformStyles = useCreateformStyle();

    const [formValues, setFormValues] = useState<FormValues>({});
    const [initialSaveDialog, setInitialSaveDialog] = useState(false);
    const { responsive } = useRes();

    const formRef = useRef<BaseForm>({
        FormID: "",
        FormName: "",
        Description: "",
        MachineID: "",
    });

    const [initialForm, setInitialForm] = useState<BaseForm>(formRef.current);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const newForm: BaseForm = {
            FormID: state.FormID || "",
            FormName: state.FormName || "",
            Description: state.Description || "",
            MachineID: state.MachineID || "",
        };
        setInitialForm(newForm);
        formRef.current = newForm;
    }, [state]);

    const handleChange = useCallback((fieldName: keyof BaseForm, value: string) => {
        const newForm = { ...formRef.current, [fieldName]: value };
        formRef.current = newForm;
        setInitialForm(newForm);
        dispatch(updateForm({ form: newForm }));
    }, [dispatch]);

    const handleSaveDialog = useCallback(() => {
        setInitialSaveDialog(false);
    }, []);

    const childRef = useRef<any>();

    const handleDrop = (item: CheckListType, absoluteX: number, absoluteY: number) => {
        const cardIndex = childRef.current.checkCardPosition(absoluteX, absoluteY);
        console.log(cardIndex);
        console.log(absoluteX);
        console.log(absoluteY);

        const selectedChecklist = checkList.find(v => v.CListID === "CL000") || checkList[0];
        const selectedDataType = dataType.find(v => v.DTypeName === "String") || dataType[0];

        if (cardIndex >= 0) {
            const targetSubForm = state.subForms[cardIndex];
            const currentFieldCount = count;

            const newField: BaseFormState = {
                MCListID: `MCL-ADD-${currentFieldCount}`,
                CListID: selectedChecklist.CListID,
                GCLOptionID: "",
                CTypeID: item.CTypeID,
                DTypeID: selectedDataType.DTypeID,
                SFormID: targetSubForm.SFormID,
                Required: false,
                Placeholder: "Empty content",
                Hint: "Empty content",
                EResult: "",
                CListName: selectedChecklist.CListName,
                CTypeName: item.CTypeName,
                DTypeValue: undefined,
                MinLength: undefined,
                MaxLength: undefined
            };

            newField.GCLOptionID = ["Dropdown", "Radio", "Checkbox"].includes(item.CTypeName)
                ? (groupCheckListOption.find(v => v.GCLOptionID === "GCLO000") || groupCheckListOption[0])?.GCLOptionID
                : undefined;

            try {
                dispatch(defaultDataForm({ currentField: newField }));

                setCount(count + 1)
            } catch (error) {
                handleError(error)
            }
        }
    };

    const validationSchema = useMemo(() => {
        const shape: any = {};

        state.subForms?.forEach((subForm: BaseSubForm) => {
            subForm.Fields?.forEach((field: BaseFormState) => {
                const dataTypeName = dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
                const checkListTypeName = checkListType.find(item => item.CTypeID === field.CTypeID)?.CTypeName;

                if (dataTypeName === "Number") {
                    let validator = Yup.number()
                        .nullable()
                        .typeError(`The ${field.CListName} field requires a valid number`);

                    if (field.Required) {
                        validator = validator.required(`The ${field.Placeholder} field is required`);
                    }

                    if (field.MinLength) {
                        validator = validator.min(field.MinLength, `The ${field.CListName} minimum value is ${field.MinLength}`);
                    }

                    if (field.MaxLength) {
                        validator = validator.max(field.MaxLength, `The ${field.CListName} maximum value is ${field.MaxLength}`);
                    }

                    shape[field.MCListID] = validator;
                } else if (dataTypeName === "String") {
                    let validator;

                    if (checkListTypeName === "Checkbox") {
                        validator = Yup.array()
                            .of(Yup.string())
                            .min(1, `The ${field.CListName} field requires at least one option to be selected`);
                    } else {
                        validator = Yup.string()
                            .nullable()
                            .typeError(`The ${field.CListName} field requires a valid string`);
                    }

                    if (field.Required) {
                        validator = validator.required(`The ${field.Placeholder} field is required`);
                    }

                    shape[field.MCListID] = validator;
                }
            });
        });

        return Yup.object().shape(shape);
    }, [state.subForms, dataType, checkListType]);

    console.log(state);

    return (
        <GestureHandlerRootView style={[createform.container, { flex: 1 }]}>
            <AccessibleView name="container-form" style={[createform.containerL1]}>
                <SegmentedControl
                    values={["Form", "Tool"]}
                    selectedIndex={selectedIndex}
                    onChange={(event) => {
                        const newIndex = event.nativeEvent.selectedSegmentIndex;
                        setSelectedIndex(newIndex);
                    }}

                    style={{ height: 80, borderRadius: 0 }}
                />

                <FlatList
                    data={[{}]}
                    renderItem={() => selectedIndex === 0 && (
                        <AccessibleView name="container-sagment" style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                            <Inputs
                                placeholder="Enter Content Name"
                                label="Content Name"
                                handleChange={(value) => handleChange("FormName", value)}
                                value={initialForm.FormName}
                                testId="form-name"
                            />
                            <Inputs
                                placeholder="Enter Description"
                                label="Description"
                                handleChange={(value) => handleChange("Description", value)}
                                value={initialForm.Description}
                                testId="form-description"
                            />

                            <Pressable
                                onPress={() => {
                                    setInitialSaveDialog(true);
                                }}
                                style={[createformStyles.saveButton, { justifyContent: "center" }]}
                            >
                                <Text style={createform.saveText}>Save Form</Text>
                            </Pressable>

                            <Divider bold style={[{ marginVertical: 10 }, masterdataStyles.backMain]} />

                            <Text style={[masterdataStyles.title, masterdataStyles.text, { textAlign: 'center', paddingTop: 10 }]}>Menu List Type</Text>

                            {checkListType.map((item, index) => (
                                <DraggableItem item={item} onDrop={handleDrop} key={`${item.CTypeID}-${index}`} />
                            ))}
                        </AccessibleView>
                    )}
                    style={{ display: selectedIndex === 0 ? 'flex' : 'none' }}
                    keyExtractor={(_, index) => `${index}`}
                    contentContainerStyle={{ flexGrow: 1 }}
                // ListHeaderComponentStyle={{ , flexGrow: 1 }}
                />
                {selectedIndex === 1 && (
                    <AccessibleView name="selectedIndex-1" style={{ display: selectedIndex === 1 ? 'flex' : 'none' }}>
                        <Dragsubform navigation={navigation}
                            state={state}
                            dispatch={dispatch}
                            checkList={checkList}
                            dataType={dataType}
                            checkListType={checkListType}
                            groupCheckListOption={groupCheckListOption} />
                    </AccessibleView>
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
        </GestureHandlerRootView >

    );
};

export default CreateFormScreen;
