import React, { useState, useEffect, useCallback, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Text } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import useForm from "@/hooks/custom/useForm";
import { AccessibleView, Inputs, SaveDialog } from "@/components";
import Dragsubform from "./Dragsubform";
import Preview from "@/app/screens/layouts/forms/view/Preview";
import { CreateFormProps } from "@/typing/tag";
import { BaseForm } from "@/typing/form";
import { updateForm } from "@/slices";

const CreateFormScreen: React.FC<CreateFormProps> = ({ route, navigation }) => {
    const { state, dispatch, checkList, groupCheckListOption, checkListType, dataType } = useForm(route);
    const createform = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles();
    
    const [initialSaveDialog, setInitialSaveDialog] = useState(false);
    const [initialForm, setInitialForm] = useState<BaseForm>({
        FormID: "",
        FormName: "",
        Description: "",
        MachineID: "",
    });

    const formRef = useRef(initialForm);

    const handleChange = useCallback((fieldName: string, value: string) => {
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
console.log(state);

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <AccessibleView style={createform.container}>
                <AccessibleView style={createform.containerL1}>
                    <SegmentedControl
                        values={["Form", "Tool"]}
                        selectedIndex={selectedIndex}
                        onChange={(event) => {
                            const newIndex = event.nativeEvent.selectedSegmentIndex;
                            setSelectedIndex(newIndex);
                        }}
                    />
                    <Animated.View style={[animatedStyle]}>
                        {selectedIndex === 0 ? (
                            <AccessibleView style={{ padding: 20 }}>
                                <AccessibleView style={{ padding: 0 }}>
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

                                    <AccessibleView style={masterdataStyles.containerAction}>
                                        <Pressable onPress={() => setInitialSaveDialog(true)} style={createform.saveButton}>
                                            <Text style={createform.saveButtonText}>Save Form</Text>
                                        </Pressable>
                                    </AccessibleView>
                                </AccessibleView>

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
                        )}
                    </Animated.View>
                </AccessibleView>

                <AccessibleView style={createform.containerL2}>
                    <Preview route={route} />
                </AccessibleView>
            </AccessibleView>
        </GestureHandlerRootView>
    );
};

export default React.memo(CreateFormScreen);
