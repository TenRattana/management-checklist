import React, { useState, useCallback, useRef, useMemo } from "react";
import {
    Animated,
    Pressable,
} from "react-native";
import {
    setDragSubForm,
    addSubForm,
    updateSubForm,
    deleteSubForm,
} from "@/slices";
import { AccessibleView, SaveDialog } from "@/components";
import SubFormDialog from "@/components/forms/SubFormDialog";
import useCreateformStyle from "@/styles/createform";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { IconButton, Text } from "react-native-paper";
import { runOnJS } from "react-native-reanimated";
import { spacing } from "@/constants/Spacing";
import Dragfield from "./Dragfield";
import { BaseSubForm } from '@/typing/form'
import { DragsubformProps } from "@/typing/tag";
import { useToast } from "@/app/contexts";

const Dragsubform: React.FC<DragsubformProps> = ({ state, dispatch, dataType, checkListType, groupCheckListOption, checkList, navigation }) => {
    const [initialDialog, setInitialDialog] = useState<boolean>(false)
    const [initialSubForm, setInitialSubForm] = useState<BaseSubForm>({ SFormID: "", SFormName: "", FormID: "", MachineID: "" });
    const [editMode, setEditMode] = useState<boolean>(false)

    const createform = useCreateformStyle();
    const { handleError } = useToast();

    const scaleValues = useRef<{ [key: string]: Animated.Value }>({});

    const getScaleValue = (subFormID: string) => {
        if (!scaleValues.current[subFormID]) {
            scaleValues.current[subFormID] = new Animated.Value(1);
        }
        return scaleValues.current[subFormID];
    };

    const animatedDefault = useMemo(() => {
        return { toValue: 1, useNativeDriver: true };
    }, []);

    const animatedScale = useMemo(() => {
        return { toValue: 0.95, useNativeDriver: true };
    }, []);

    const handleDropSubForm = (data: Omit<BaseSubForm, 'DisplayOrder'>[]) => {
        runOnJS(dispatch)(setDragSubForm({ data }));
    };

    const onPressIn = (subFormID: string) => {
        Animated.spring(getScaleValue(subFormID), animatedScale).start();
    };

    const onPressOut = (subFormID: string) => {
        Animated.spring(getScaleValue(subFormID), animatedDefault).start();
    };

    const handelSetDialog = useCallback(() => {
        setEditMode(false)
        setInitialDialog(false)
    }, [])

    const handelSubForm = useCallback((item?: BaseSubForm) => {
        item ? setInitialSubForm(item) :
            setInitialSubForm({ SFormID: "", SFormName: "", FormID: "", MachineID: "" })
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

    console.log(state);

    const renderSubForm = ({ item, drag, isActive }: { item: BaseSubForm; drag: () => void; isActive: boolean; }) => {

        return (
            <Animated.View style={{ transform: [{ scale: getScaleValue(item.SFormID) }] }}>
                <ScaleDecorator>
                    <AccessibleView style={{ marginBottom: 30 }}>
                        <Pressable
                            onPress={() => {
                                setEditMode(true);
                                setInitialDialog(true);
                                handelSubForm(item);
                            }}
                            onPressIn={() => onPressIn(item.SFormID)}
                            onPressOut={() => onPressOut(item.SFormID)}
                            onLongPress={drag}
                            disabled={isActive}
                            style={[
                                createform.subFormContainer,
                                isActive ? createform.active : null
                            ]}
                            testID={`dg-SF-${item.SFormID}`}
                        >
                            <IconButton icon={"credit-card-plus"} size={spacing.large} animated />
                            <Text style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                                Sub Form: {item.SFormName}
                            </Text>
                            <IconButton icon="chevron-right" size={18} />
                        </Pressable>

                        <Dragfield
                            data={item?.Fields ?? []}
                            SFormID={item.SFormID}
                            dispatch={dispatch}
                            checkList={checkList}
                            dataType={dataType}
                            checkListType={checkListType}
                            groupCheckListOption={groupCheckListOption}
                        />
                    </AccessibleView>

                </ScaleDecorator>
            </Animated.View>
        );
    };

    return (
        <AccessibleView style={{ flex: 1 }}>
            <Pressable
                onPress={() => {
                    setInitialDialog(true);
                    handelSubForm();
                }}
                style={[createform.addSubFormButton]}
            >
                <IconButton icon="plus" size={16} />
                <Text style={createform.addSubFormText}>Add Sub Form</Text>
            </Pressable>

            <DraggableFlatList
                data={state.subForms}
                renderItem={renderSubForm}
                keyExtractor={(item, index) => `SF-${item.SFormID}-${index}`}
                onDragEnd={({ data }) => handleDropSubForm(data)}
                contentContainerStyle={{ paddingHorizontal: 50, paddingTop: 5, paddingBottom: state.subForms.length > 0 ? 40 : 0 }}
                nestedScrollEnabled={true}
                activationDistance={1}
                autoscrollSpeed={30}
            />

            <SubFormDialog
                isVisible={initialDialog}
                setIsVisible={handelSetDialog}
                isEditing={editMode}
                initialValues={initialSubForm}
                saveData={handelSaveSubForm}
                onDelete={(SFormID: string) => dispatch(deleteSubForm({ SFormID }))}
            />

        </AccessibleView>

    )
}

export default React.memo(Dragsubform)
