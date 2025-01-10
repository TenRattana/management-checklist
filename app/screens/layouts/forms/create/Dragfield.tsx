import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
    deleteField,
    setDragField
} from "@/slices";
import FieldDialog from "@/components/forms/FieldDialog";
import { Icon, IconButton } from "react-native-paper";
import { NestableDraggableFlatList, NestableScrollContainer, RenderItemParams, ScaleDecorator, ShadowDecorator } from "react-native-draggable-flatlist";
import useCreateformStyle from "@/styles/createform";
import { BaseFormState, BaseSubForm } from '@/typing/form'
import { DragfieldProps } from "@/typing/tag";
import { useTheme } from "@/app/contexts/useTheme";
import Text from '@/components/Text'
import useMasterdataStyles from "@/styles/common/masterdata";
import { CheckList } from "@/typing/type";
import { useRes } from "@/app/contexts/useRes";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/stores";

interface RowItemProps<V extends BaseFormState | BaseSubForm> {
    item: V;
    drag: () => void;
    getIndex: () => number | undefined;
    isActive: boolean;
    setIsEditing: any;
    setDialogVisible: any
    handleField: any
    checkListType: any[]
}

const RowItem = React.memo(({ item, drag, isActive, setIsEditing, setDialogVisible, handleField, checkListType }: RowItemProps<BaseFormState>) => {
    const { theme } = useTheme()
    const { spacing } = useRes()
    const createformStyles = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles()

    return (
        <View style={{ flexDirection: 'row', marginLeft: 20 }}>
            <View style={{ alignSelf: 'center' }}>
                <Icon
                    source={"subdirectory-arrow-right"}
                    color={theme.colors.onBackground}
                    size={spacing.medium}
                />
            </View>

            <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
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
                        iconColor={theme.colors.onBackground}
                        size={spacing.large}
                        animated
                    />
                    <Text
                        style={[masterdataStyles.text, { textAlign: "left", flex: 1, paddingLeft: 5 }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.CListName}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

const Dragfield: React.FC<DragfieldProps> = React.memo(({ data, SFormID, checkLists }) => {
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [currentField, setCurrentField] = useState<BaseFormState>({
        MCListID: "", CListID: "", GCLOptionID: "", CTypeID: "", DTypeID: "", SFormID: SFormID,
        Required: false, Important: false, ImportantList: [], EResult: "", CListName: "", DTypeValue: undefined,
    });
    const dispatch = useDispatch<AppDispatch>();

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const { theme } = useTheme()
    const { spacing } = useRes()

    const createformStyles = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles()

    const handleDropField = useCallback((data: Omit<BaseFormState, 'DisplayOrder'>[]) => {
        dispatch(setDragField({ data }));
    }, [dispatch]);

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

    const renderField = useCallback((params: RenderItemParams<BaseFormState>) => {
        return (
            <ShadowDecorator>
                <ScaleDecorator activeScale={0.90}>
                    <RowItem {...params} checkListType={checkLists} handleField={handleField} setDialogVisible={setDialogVisible} setIsEditing={setIsEditing} />
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
                extraData={data}
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
                style={createformStyles.fieldContainer}
            >
                <IconButton icon="plus" iconColor={theme.colors.onBackground} size={spacing.large} style={createformStyles.icon} animated />
                <Text style={[masterdataStyles.text, { marginLeft: 8, paddingVertical: 10 }]}>Add Field</Text>
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
