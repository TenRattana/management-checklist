import React, { useState, useCallback, useRef, useMemo } from "react";
import {
    Animated,
    Pressable,
} from "react-native";
import {
    addField,
    updateField,
    deleteField,
    setDragField
} from "@/slices";
import FieldDialog from "@/components/forms/FieldDialog";
import { IconButton, Text } from "react-native-paper";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { runOnJS } from "react-native-reanimated";
import { spacing } from "@/constants/Spacing";
import useCreateformStyle from "@/styles/createform";
import { BaseFormState } from '@/typing/form'
import { DragfieldProps } from "@/typing/tag";
import { useToast } from "@/app/contexts";

const Dragfield: React.FC<DragfieldProps> = ({ data, SFormID, dispatch, dataType, checkListType, groupCheckListOption, checkList }) => {
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [currentField, setCurrentField] = useState<BaseFormState>({
        MCListID: "", CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: SFormID,
        Required: false, Placeholder: "", Hint: "", EResult: "", CListName: "", DTypeValue: undefined, MinLength: undefined, MaxLength: undefined
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [count, setCount] = useState<number>(0)

    const { handleError } = useToast();

    const createformStyles = useCreateformStyle();
    const scaleValues = useRef<{ [key: string]: Animated.Value }>({});

    const getScaleValue = (subFormID: string) => {
        if (!scaleValues.current[subFormID]) {
            scaleValues.current[subFormID] = new Animated.Value(1);
        }
        return scaleValues.current[subFormID];
    };

    const animatedDefault = useMemo(() => ({
        toValue: 1,
        useNativeDriver: true,
    }), []);

    const animatedScale = useMemo(() => ({
        toValue: 0.95,
        useNativeDriver: true,
    }), []);

    const handleDropField = (data: Omit<BaseFormState, 'DisplayOrder'>[]) => {
        runOnJS(dispatch)(setDragField({ data }));
    };

    const onPressIn = (subFormID: string) => {
        Animated.spring(getScaleValue(subFormID), animatedScale).start();
    };

    const onPressOut = (subFormID: string) => {
        Animated.spring(getScaleValue(subFormID), animatedDefault).start();
    };

    const handleDialogToggle = useCallback(() => {
        setIsEditing(false);
        setDialogVisible(prev => !prev);
    }, []);

    const handleField = useCallback((item?: BaseFormState) => {
        setCount(count + 1)
        setCurrentField(item || {
            MCListID: `MCL-ADD-${count}`, CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: SFormID,
            Required: false, Placeholder: "", Hint: "", EResult: "", CListName: "", DTypeValue: undefined, MinLength: undefined, MaxLength: undefined
        });
    }, []);

    const handleSaveField = useCallback((values: BaseFormState, mode: string) => {
        const payload = { BaseFormState: values, checkList, checkListType, dataType };

        try {
            if (mode === "add") {
                dispatch(addField(payload));
            } else if (mode === "update") {
                dispatch(updateField(payload));
            }
        } catch (error) {
            handleError(error);
        } finally {
            handleDialogToggle();
        }
    }, []);

    const dropcheckList = checkList.filter(v => v.IsActive);
    const dropcheckListType = checkListType.filter(v => v.IsActive);
    const dropdataType = dataType.filter(v => v.IsActive);
    const dropgroupCheckListOption = groupCheckListOption.filter(v => v.IsActive);

    const renderField = ({ item, drag, isActive }: { item: BaseFormState; drag: () => void; isActive: boolean; }) => {
        return (
            <Animated.View style={{ transform: [{ scale: getScaleValue(item.SFormID) }] }}>
                <ScaleDecorator>
                    <Pressable
                        onPressIn={() => onPressIn(item.SFormID)}
                        onPressOut={() => onPressOut(item.SFormID)}
                        onPress={() => {
                            setIsEditing(true);
                            setDialogVisible(true);
                            handleField(item);
                        }}
                        onLongPress={drag}
                        disabled={isActive}
                        style={[createformStyles.fieldContainer, isActive && createformStyles.active]}
                        testID={`dg-FD-${item.SFormID}`}
                    >
                        <IconButton icon={checkListType.find((v) => v.CTypeID === item.CTypeID)?.Icon ?? "camera"} size={spacing.large + 5} animated />
                        <Text style={[createformStyles.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                            {item.CListName}
                        </Text>
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
                renderItem={({ item, drag, isActive }) => renderField({ item, drag, isActive })}
                keyExtractor={(item, index) => `FD-${item.SFormID}-${index}`}
                onDragEnd={({ data }) => handleDropField(data)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}
                nestedScrollEnabled
                activationDistance={1}
                autoscrollSpeed={30}
            />
            <Pressable
                onPress={() => {
                    handleDialogToggle();
                    handleField();
                }}
                style={[createformStyles.fieldContainer, { justifyContent: "center", opacity: 0.5 }]}
            >
                <IconButton icon="plus" size={16} />
                <Text style={createformStyles.addSubFormText}>Add Field</Text>
            </Pressable>

            <FieldDialog
                isVisible={dialogVisible}
                formState={currentField}
                onDeleteField={(SFormID, MCListID) => runOnJS(dispatch)(deleteField({ SFormID, MCListID }))}
                setShowDialogs={handleDialogToggle}
                editMode={isEditing}
                saveField={handleSaveField}
                checkListType={checkListType}
                dataType={dataType}
                checkList={checkList}
                groupCheckListOption={groupCheckListOption}
                dropcheckList={dropcheckList}
                dropcheckListType={dropcheckListType}
                dropdataType={dropdataType}
                dropgroupCheckListOption={dropgroupCheckListOption} />
        </>
    );
}

export default Dragfield;
