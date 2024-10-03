import React, { useState, useCallback, useRef, useMemo } from "react";
import {
    Animated,
    Pressable,
    TouchableOpacity,
} from "react-native";
import {
    setDragSubForm,
    addSubForm,
    updateSubForm,
    deleteSubForm,
} from "@/slices";
import useForm from '@/hooks/custom/useForm';
import { AccessibleView } from "@/components";
import SubFormDialog from "@/components/forms/SubFormDialog";
import useCreateformStyle from "@/styles/createform";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { IconButton, Text } from "react-native-paper";
import { runOnJS } from "react-native-reanimated";
import { spacing } from "@/constants/Spacing";
import Dragfield from "./Dragfield";

interface FormState {
    MCListID: string;
    CListID: string;
    GCLOptionID: string;
    CTypeID: string;
    CListName?: string;
    CTypeName?: string;
    DTypeID: string;
    DTypeValue?: number;
    SFormID: string;
    Required: boolean;
    MinLength?: number;
    MaxLength?: number;
    Description: string;
    Placeholder: string;
    Hint: string;
    DisplayOrder?: number;
    EResult: string;
}

interface BaseSubForm {
    SFormID: string;
    SFormName: string;
    FormID: string;
    Columns?: number;
    DisplayOrder?: number;
    MachineID: string;
    Fields?: FormState[];
}

interface DragsubformProps {
    route: any;
}

const Dragsubform: React.FC<DragsubformProps> = ({ route }) => {
    const { state, dispatch, errorMessage } = useForm(route);
    const [initialDialog, setInitialDialog] = useState<boolean>(false)
    const [initialSubForm, setInitialSubForm] = useState<BaseSubForm>({ SFormID: "", SFormName: "", FormID: "", MachineID: "" });
    const [editMode, setEditMode] = useState<boolean>(false)

    const createform = useCreateformStyle();

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
            errorMessage(error)
        } finally {
            handelSetDialog()
        }
    }, [])

    const renderSubForm = ({ item, drag, isActive }: { item: BaseSubForm; drag: () => void; isActive: boolean; }) => {

        return (
            <Animated.View style={{ transform: [{ scale: getScaleValue(item.SFormID) }] }}>
                <ScaleDecorator>
                    <AccessibleView style={{ marginBottom: 30 }}>
                        <TouchableOpacity
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
                        </TouchableOpacity>

                        <Dragfield
                            data={item.Fields ?? []}
                            route={route}
                        />
                    </AccessibleView>

                </ScaleDecorator>
            </Animated.View>
        );
    };


    return (
        <>
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
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}
                nestedScrollEnabled={true}
                activationDistance={1}
                autoscrollSpeed={30}
            />

            <SubFormDialog
                isVisible={initialDialog}
                setShowDialogs={handelSetDialog}
                editMode={editMode}
                subForm={initialSubForm}
                saveSubForm={handelSaveSubForm}
                onDelete={(SFormID: string) => dispatch(deleteSubForm({ SFormID }))}
            />
        </>

    )
}

export default Dragsubform
