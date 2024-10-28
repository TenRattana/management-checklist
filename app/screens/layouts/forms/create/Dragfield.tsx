import React, { useState, useCallback } from "react";
import {
    Pressable,
} from "react-native";
import {
    addField,
    updateField,
    deleteField,
    setDragField
} from "@/slices";
import FieldDialog from "@/components/forms/FieldDialog";
import { IconButton } from "react-native-paper";
import { NestableDraggableFlatList, RenderItemParams, ScaleDecorator, ShadowDecorator } from "react-native-draggable-flatlist";
import { runOnJS } from "react-native-reanimated";
import { spacing } from "@/constants/Spacing";
import useCreateformStyle from "@/styles/createform";
import { BaseFormState, RowItemProps } from '@/typing/form'
import { DragfieldProps } from "@/typing/tag";
import { useTheme, useToast } from "@/app/contexts";
import Text from '@/components/Text'

const Dragfield: React.FC<DragfieldProps> = ({ data, SFormID, dispatch, dataType, checkListType, groupCheckListOption, checkList }) => {
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [currentField, setCurrentField] = useState<BaseFormState>({
        MCListID: "", CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: SFormID,
        Required: false, Placeholder: "", Hint: "", EResult: "", CListName: "", DTypeValue: undefined, MinLength: undefined, MaxLength: undefined
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [count, setCount] = useState<number>(0)
    const { handleError } = useToast();
    const { theme } = useTheme()
    const createformStyles = useCreateformStyle();

    const handleDropField = (data: Omit<BaseFormState, 'DisplayOrder'>[]) => {
        runOnJS(dispatch)(setDragField({ data }));
    };

    const handleDialogToggle = useCallback(() => {
        setIsEditing(false);
        setDialogVisible(prev => !prev);
    }, []);

    const handleField = (item?: BaseFormState) => {
        item ? setCurrentField(item) :
            setCurrentField({
                MCListID: `MCL-ADD-${count}`, CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: SFormID,
                Required: false, Placeholder: "", Hint: "", EResult: "", CListName: "", DTypeValue: undefined, MinLength: undefined, MaxLength: undefined
            })
    };

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
            setCount(prevCount => prevCount + 1);
            handleDialogToggle();
        }
    }, [dispatch, handleError, handleDialogToggle, checkList, checkListType, dataType]);

    const dropcheckList = checkList.filter(v => v.IsActive);
    const dropcheckListType = checkListType.filter(v => v.IsActive);
    const dropdataType = dataType.filter(v => v.IsActive);
    const dropgroupCheckListOption = groupCheckListOption.filter(v => v.IsActive);

    const RowItem = ({ item, drag, isActive }: RowItemProps<BaseFormState>) => {
        return (
            <Pressable
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
                <IconButton icon={checkListType.find((v) => v.CTypeID === item.CTypeID)?.Icon ?? "camera"} style={createformStyles.icon} iconColor={theme.colors.background} size={spacing.large} animated />
                <Text style={[createformStyles.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                    {item.CListName}
                </Text>
                <IconButton icon="chevron-right" iconColor={theme.colors.background} size={spacing.large} style={createformStyles.icon} animated />
            </Pressable>
        );
    }

    const renderField = useCallback((params: RenderItemParams<BaseFormState>) => {
        return (
            <ShadowDecorator>
                <ScaleDecorator activeScale={0.98}>
                    <RowItem {...params} />
                </ScaleDecorator>
            </ShadowDecorator>
        );
    }, []);

    return (
        <>
            <NestableDraggableFlatList
                data={data}
                renderItem={renderField}
                keyExtractor={(item, index) => `FD-${item.SFormID}-${index}`}
                onDragEnd={({ data }) => handleDropField(data)}
                activationDistance={1}
            />
            <Pressable
                onPress={() => {
                    handleDialogToggle();
                    handleField();
                }}
                style={[createformStyles.fieldContainer, { justifyContent: "center", opacity: 0.5 }]}
            >
                <IconButton icon="plus" iconColor={theme.colors.background} size={spacing.large} style={createformStyles.icon} animated />
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
                dropgroupCheckListOption={dropgroupCheckListOption}
            />
        </>

    );
}

export default React.memo(Dragfield);
