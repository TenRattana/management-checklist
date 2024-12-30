import React, { useState, useCallback, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import {
    deleteField,
    setDragField
} from "@/slices";
import FieldDialog from "@/components/forms/FieldDialog";
import { IconButton } from "react-native-paper";
import { NestableDraggableFlatList, NestableScrollContainer, RenderItemParams, ScaleDecorator, ShadowDecorator } from "react-native-draggable-flatlist";
import { spacing } from "@/constants/Spacing";
import useCreateformStyle from "@/styles/createform";
import { BaseFormState, RowItemProps } from '@/typing/form'
import { DragfieldProps } from "@/typing/tag";
import { useTheme } from "@/app/contexts/useTheme";
import Text from '@/components/Text'
import useMasterdataStyles from "@/styles/common/masterdata";
import { CheckList } from "@/typing/type";

const Dragfield: React.FC<DragfieldProps> = React.memo(({ data, SFormID, dispatch, checkListType }) => {
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [currentField, setCurrentField] = useState<BaseFormState>({
        MCListID: "", CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: SFormID,
        Required: false, Important: false, ImportantList: [], EResult: "", CListName: "", DTypeValue: undefined,
    });

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const { theme } = useTheme()
    const createformStyles = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles()

    const handleDropField = (data: Omit<BaseFormState, 'DisplayOrder'>[]) => {
        dispatch(setDragField({ data }));
    };

    const handleDialogToggle = useCallback(() => {
        setIsEditing(false);
        setDialogVisible((prev) => !prev);
    }, []);

    const handleField = (item?: BaseFormState) => {
        const idMcl = `MCL-ADD-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

        item
            ? setCurrentField(item)
            : setCurrentField({
                MCListID: idMcl,
                CListID: "",
                GCLOptionID: "",
                CTypeID: "",
                DTypeID: "",
                SFormID: SFormID,
                Required: false,
                Important: false,
                ImportantList: [{
                    MCListID: idMcl,
                    Value: undefined,
                    MinLength: undefined,
                    MaxLength: undefined
                }],
                EResult: "",
                CListName: "",
                DTypeValue: undefined,
            });
    };

    const RowItem = React.memo(({ item, drag, isActive }: RowItemProps<BaseFormState>) => {
        return (
            <TouchableOpacity
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
                <IconButton
                    icon={checkListType.find((v: CheckList) => v.CTypeID === item.CTypeID)?.Icon ?? "camera"}
                    style={createformStyles.icon}
                    iconColor={theme.colors.fff}
                    size={spacing.large}
                    animated
                />
                <Text
                    style={[createformStyles.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.CListName}
                </Text>
                <IconButton
                    icon="chevron-right"
                    iconColor={theme.colors.fff}
                    size={spacing.large}
                    style={createformStyles.icon}
                    animated
                />
            </TouchableOpacity>
        );
    });

    const renderField = useCallback((params: RenderItemParams<BaseFormState>) => {
        return (
            <ShadowDecorator>
                <ScaleDecorator activeScale={0.90}>
                    <RowItem {...params} />
                </ScaleDecorator>
            </ShadowDecorator>
        );
    }, []);

    const MemoFieldDialog = React.memo(FieldDialog)
    return (
        <NestableScrollContainer>
            <NestableDraggableFlatList
                data={data}
                renderItem={renderField}
                keyExtractor={(item, index) => `FD-${item.SFormID}-${index}`}
                onDragEnd={({ data }) => handleDropField(data)}
                getItemLayout={(data, index) => ({ length: 60, offset: 60 * index, index })}
                activationDistance={1}
            />

            <TouchableOpacity
                onPress={() => {
                    handleDialogToggle();
                    handleField();
                }}
                style={[createformStyles.fieldContainer, { justifyContent: "center", opacity: 0.8 }]}
            >
                <IconButton icon="plus" iconColor={theme.colors.fff} size={spacing.large} style={createformStyles.icon} animated />
                <Text style={[masterdataStyles.textFFF, { marginLeft: 8, paddingVertical: 10 }]}>Add Field</Text>
            </TouchableOpacity>

            {dialogVisible && (
                <MemoFieldDialog
                    isVisible={dialogVisible}
                    formState={currentField}
                    onDeleteField={(SFormID, MCListID) => dispatch(deleteField({ SFormID, MCListID }))}
                    setShowDialogs={handleDialogToggle}
                    editMode={isEditing}
                />
            )}
        </NestableScrollContainer >
    );
})

export default Dragfield;
