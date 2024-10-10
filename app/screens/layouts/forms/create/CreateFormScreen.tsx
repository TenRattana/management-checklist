import React, { useState, useEffect, useCallback, useRef } from "react";
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { Dimensions, Pressable, FlatList } from "react-native";
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
import { BaseForm } from "@/typing/form";
import { updateForm } from "@/slices";
import DragTool from "./DragTool";

const CreateFormScreen: React.FC<CreateFormProps> = ({ route, navigation }) => {
    const { state, dispatch, checkList, groupCheckListOption, checkListType, dataType } = useForm(route);
    const createform = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles();
    console.log("CreateFormScreen");

    const [initialSaveDialog, setInitialSaveDialog] = useState(false);

    const formRef = useRef<BaseForm>({
        FormID: "",
        FormName: "",
        Description: "",
        MachineID: "",
    });

    const [initialForm, setInitialForm] = useState<BaseForm>(formRef.current);

    const handleChange = useCallback((fieldName: keyof BaseForm, value: string) => {
        const newForm = { ...formRef.current, [fieldName]: value };
        formRef.current = newForm;
        setInitialForm(newForm);
        dispatch(updateForm({ form: newForm }));
    }, [dispatch]);

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

    const [selectedIndex, setSelectedIndex] = useState(0);
    const transition = useSharedValue(0);

    useEffect(() => {
        transition.value = withTiming(selectedIndex, { duration: 300 });
    }, [selectedIndex]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: 1,
        transform: [{ translateX: 0 }],
    }));

    const handleSaveDialog = useCallback(() => {
        setInitialSaveDialog(false);
    }, []);

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <AccessibleView name="container-laout1" style={createform.container}>
                <AccessibleView name="contaner-sagment" style={createform.containerL1}>
                    <SegmentedControl
                        values={["Form", "Tool"]}
                        selectedIndex={selectedIndex}
                        onChange={(event) => {
                            const newIndex = event.nativeEvent.selectedSegmentIndex;
                            setSelectedIndex(newIndex);
                        }}
                        style={{ height: 40, marginVertical: 20, borderRadius: 0 }}
                    />
                    <Animated.View style={[animatedStyle]}>
                        {selectedIndex === 0 ? (
                            <>
                                <AccessibleView name="container-form">
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
                                </AccessibleView>

                                <Divider />

                               {checkListType && (
                                    <DragTool checkListType={checkListType}/>
                                )}

                                <SaveDialog
                                    state={state}
                                    isVisible={initialSaveDialog}
                                    setIsVisible={handleSaveDialog}
                                    navigation={navigation}
                                />
                            </>
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
                        )}
                    </Animated.View>
                </AccessibleView>

                <AccessibleView name="container-layout2" style={createform.containerL2}>
                    <Preview route={route} />
                </AccessibleView>
            </AccessibleView>
        </GestureHandlerRootView>
    );
};

export default React.memo(CreateFormScreen);
