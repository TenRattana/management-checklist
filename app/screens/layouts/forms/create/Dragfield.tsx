import React, { useState, useCallback, useRef, useMemo } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    ScrollView,
    View,
    TouchableOpacity,
} from "react-native";
import {
    addField,
    updateField,
    deleteField,
    setDragField
} from "@/slices";
import useForm from '@/hooks/custom/useForm';
import { AccessibleView } from "@/components";
import FieldDialog from "@/components/forms/FieldDialog";
import { useToast } from "@/app/contexts";
import useCreateformStyle from "@/styles/createform";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { IconButton, Text } from "react-native-paper";
import axiosInstance from "@/config/axios";
import {
    runOnJS,
} from "react-native-reanimated";
import { spacing } from "@/constants/Spacing";

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

interface renderFieldProps {
    item: FormState;
    drag: () => void;
    isActive: boolean;
    subFormID: string;
}
interface DragfieldProps {
    route: any;
    data: FormState[];
}
const Dragfield: React.FC<DragfieldProps> = ({ route, data }) => {
    const { dispatch, checkListType, dataType, checkList, errorMessage, groupCheckListOption } = useForm(route);
    const [initialDialog, setInitialDialog] = useState<boolean>(false)
    const [initialField, setInitialField] = useState<FormState>({ MCListID: "", CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: "", Required: false, Description: "", Placeholder: "", Hint: "", EResult: "", CListName: "", CTypeName: "", DTypeValue: undefined, MinLength: undefined, MaxLength: undefined });
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

    const handleDropField = (data: Omit<FormState, 'DisplayOrder'>[]) => {
        runOnJS(dispatch)(setDragField({ data }));
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

    const handelField = useCallback((item?: FormState) => {
        item ? setInitialField(item) :
            setInitialField({ MCListID: "", CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: "", Required: false, Description: "", Placeholder: "", Hint: "", EResult: "", CListName: "", CTypeName: "", DTypeValue: undefined, MinLength: undefined, MaxLength: undefined })
    }, [])

    const handelSaveField = useCallback((values: FormState, mode: string) => {
        const payload = { formState: values, checkList, checkListType, dataType, };

        try {
            if (mode === "add") {
                dispatch(addField(payload));
            } else if (mode === "update") {
                dispatch(updateField(payload));
            }
        } catch (error) {
            errorMessage(error)
        } finally {
            handelSetDialog()
        }
    }, [])


    const dropcheckList = checkList.filter(v => v.IsActive);
    const dropcheckListType = checkListType.filter(v => v.IsActive);
    const dropdataType = dataType.filter(v => v.IsActive);
    const dropgroupCheckListOption = groupCheckListOption.filter(v => v.IsActive);

    const renderField = ({ item, drag, isActive, subFormID }: { item: FormState; drag: () => void; isActive: boolean; subFormID: string; }) => {
        return (
            <Animated.View style={{ transform: [{ scale: getScaleValue(subFormID) }] }}>
                <ScaleDecorator>
                    <Pressable
                        onPressIn={() => onPressIn(subFormID)}
                        onPressOut={() => onPressOut(subFormID)}
                        onPress={() => {
                            setEditMode(true);
                            setInitialDialog(true);
                            handelField(item)
                        }}
                        onLongPress={drag}
                        disabled={isActive}
                        style={[createform.fieldContainer, isActive ? createform.active : null]}
                        testID={`dg-SF-${item.SFormID}`}
                    >
                        <IconButton icon={checkListType.find((v) => v.CTypeID === item.CTypeID)?.Icon ?? "camera"} size={spacing.large + 5} animated />
                        <Text style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                            {item.CListName}</Text>
                        <IconButton icon="chevron-right" size={18} />
                    </Pressable>
                </ScaleDecorator>
            </Animated.View>
        );
    };

    return (
        <>
            <DraggableFlatList
                data={data}
                renderItem={({ item, drag, isActive }) => {
                    const fieldProps: renderFieldProps = {
                        item,
                        drag,
                        isActive,
                        subFormID: item.SFormID,
                    };
                    return (renderField)(fieldProps);
                }}
                keyExtractor={(item, index) => `SF-${item.SFormID}-${index}`}
                onDragEnd={({ data }) => handleDropField(data)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}
                nestedScrollEnabled={true}
                activationDistance={1}
                autoscrollSpeed={30}
            />
            <Pressable
                onPress={() => {
                    setInitialDialog(true)
                }}
                style={[createform.fieldContainer, { justifyContent: "center", opacity: 5 }]}
            >
                <IconButton icon="plus" size={16} />
                <Text style={createform.addSubFormText}>Add Field</Text>
            </Pressable>

            <FieldDialog
                isVisible={initialDialog}
                formState={initialField}
                onDeleteField={(SFormID, MCListID) => runOnJS(dispatch)(deleteField({ SFormID, MCListID }))}
                setShowDialogs={handelSetDialog}
                editMode={editMode}
                saveField={handelSaveField}
                checkListType={checkListType}
                dataType={dataType}
                checkList={checkList}
                groupCheckListOption={groupCheckListOption}
                dropcheckList={dropcheckList}
                dropcheckListType={dropcheckListType}
                dropdataType={dropdataType}
                dropgroupCheckListOption={dropgroupCheckListOption}
            />
        </>
    )
}

export default Dragfield
