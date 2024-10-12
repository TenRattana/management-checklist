import React, { useState, useEffect, useCallback, useRef } from "react";
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent, ScrollView } from "react-native-gesture-handler";
import { Dimensions, Pressable, FlatList, View, LayoutRectangle, Alert } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from "react-native-reanimated";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { IconButton, Text, Divider } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import useForm from "@/hooks/custom/useForm";
import { AccessibleView, Inputs, SaveDialog } from "@/components";
import Dragsubform from "./Dragsubform";
import Preview from "@/app/screens/layouts/forms/view/Preview";
import { CreateFormProps } from "@/typing/tag";
import { BaseForm, BaseFormState } from "@/typing/form";
import { updateForm } from "@/slices";
import { CheckListType, DataType } from "@/typing/type";
import { useRes } from "@/app/contexts";
import { defaultDataForm } from "@/slices";

const DraggableItem: React.FC<{
    item: CheckListType;
    onDrop: (item: CheckListType, x: number, y: number) => void;
}> = ({ item, onDrop }) => {
    const itemTranslateX = useSharedValue(0);
    const itemTranslateY = useSharedValue(0);

    const itemAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: itemTranslateX.value },
            { translateY: itemTranslateY.value },
        ],
    }));

    const createform = useCreateformStyle();
    const { spacing } = useRes();

    const onGestureEvent = (e: any) => {
        itemTranslateX.value = e.nativeEvent.translationX;
        itemTranslateY.value = e.nativeEvent.translationY;
    };

    const onGestureEnd = (e: any) => {
        const { absoluteX, absoluteY } = e.nativeEvent;

        runOnJS(onDrop)(item, absoluteX, absoluteY);

        itemTranslateX.value = withSpring(0);
        itemTranslateY.value = withSpring(0);
    };

    return (
        <AccessibleView name={`drag-form-${item.CTypeID}`} style={{ paddingHorizontal: 16 }}>
            <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
                <Animated.View style={[{ marginHorizontal: 10 }, itemAnimatedStyle, createform.addSubFormButton]}>
                    <IconButton icon={item.Icon} size={spacing.large + 5} animated />
                    <Text style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                        {item.CTypeName}
                    </Text>
                </Animated.View>
            </PanGestureHandler>
        </AccessibleView>
    );
};

const CreateFormScreen: React.FC<CreateFormProps> = ({ route, navigation }) => {
    const { state, dispatch, checkList, groupCheckListOption, checkListType, dataType } = useForm(route);
    const createform = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles();

    const [initialSaveDialog, setInitialSaveDialog] = useState(false);

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

    const childRef = useRef<any>()

    const handleDrop = (item: CheckListType, x: number, y: number) => {
        const cardIndex = childRef.current.checkCardPosition(x, y);

        if (cardIndex >= 0) {
            const SFormID = state.subForms[cardIndex].SFormID

            const MDcount = state.subForms[cardIndex]?.Fields?.length ?? 0
            const CL = checkList.find(v => v.CListID === "CL000") || checkList[0];
            const DT = dataType.find((v) => v.DTypeName === "String") || dataType[0]

            const currentField: BaseFormState = {
                MCListID: `MCL-ADD-${MDcount}`, CListID: CL.CListID, GCLOptionID: "", CTypeID: item.CTypeID, DTypeID: DT.DTypeID, SFormID: SFormID,
                Required: false, Placeholder: "Empty content", Hint: "Empty content", EResult: "", CListName: CL.CListName, CTypeName: item.CTypeName, DTypeValue: undefined, MinLength: undefined, MaxLength: undefined
            };

            currentField.GCLOptionID = ["Dropdown", "Radio", "Checkbox"].includes(item.CTypeName)
                ? (groupCheckListOption.find((v) => v.GCLOptionID === "GCLO000") || groupCheckListOption[0])?.GCLOptionID
                : undefined

            console.log(currentField);

            dispatch(defaultDataForm({ currentField }))
        }
    };

    return (
        <AccessibleView name="create-form" style={createform.container}>
            <AccessibleView name="container-segment" style={createform.containerL1}>
                <SegmentedControl
                    values={["Form", "Tool"]}
                    selectedIndex={selectedIndex}
                    onChange={(event) => {
                        const newIndex = event.nativeEvent.selectedSegmentIndex;
                        setSelectedIndex(newIndex);
                    }}
                    style={{ height: 80, marginBottom: 10 }}
                />
                <FlatList
                    data={[{}]}
                    renderItem={() =>
                        selectedIndex === 0 ? (
                            <AccessibleView name="form" style={{ flexGrow: 1 }}>
                                <Inputs
                                    placeholder="Enter Content Name"
                                    label="Content Name"
                                    handleChange={(value) => handleChange("FormName", value)}
                                    value={initialForm.FormName}
                                />
                                <Inputs
                                    label="Content Description"
                                    placeholder="Enter Content Description"
                                    handleChange={(value) => handleChange("Description", value)}
                                    value={initialForm.Description}
                                />
                                <AccessibleView name="save-form" style={masterdataStyles.containerAction}>
                                    <Pressable onPress={() => setInitialSaveDialog(true)} style={createform.saveButton}>
                                        <Text style={createform.saveButtonText}>Save Form</Text>
                                    </Pressable>
                                </AccessibleView>

                                <Divider />

                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, { textAlign: 'center', marginVertical: 10 }]}>
                                    Tool
                                </Text>

                                {checkListType && checkListType.map((item, index) => (
                                    <DraggableItem item={item} onDrop={handleDrop} key={`${item.CTypeID}-${index}`} />
                                ))}

                                <SaveDialog
                                    state={state}
                                    isVisible={initialSaveDialog}
                                    setIsVisible={handleSaveDialog}
                                    navigation={navigation}
                                />
                            </AccessibleView>
                        ) : (
                            <Dragsubform
                                navigation={navigation}
                                state={state}
                                dispatch={dispatch}
                                checkList={checkList}
                                dataType={dataType}
                                checkListType={checkListType}
                                groupCheckListOption={groupCheckListOption}
                            />
                        )
                    }
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={{ maxHeight: 900, paddingBottom: 30 }}
                />

            </AccessibleView>

            <AccessibleView name="container-layout2" style={createform.containerL2}>
                <Preview route={route} ref={childRef} />
            </AccessibleView>

        </AccessibleView>
    );
};

export default React.memo(CreateFormScreen);
