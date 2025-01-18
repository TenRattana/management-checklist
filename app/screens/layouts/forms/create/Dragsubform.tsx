import React, { useState, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
    setDragSubForm,
    addSubForm,
    updateSubForm,
    deleteSubForm,
    setOpen,
} from "@/slices";
import { Text } from "@/components";
import SubFormDialog from "@/components/forms/SubFormDialog";
import useCreateformStyle from "@/styles/createform";
import {
    RenderItemParams,
    ScaleDecorator,
    NestableScrollContainer,
    NestableDraggableFlatList,
    ShadowDecorator,
} from "react-native-draggable-flatlist";
import { IconButton } from "react-native-paper";
import Dragfield from "./Dragfield";
import { BaseSubForm, RowItemProps } from "@/typing/form";
import { useToast } from "@/app/contexts/useToast";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import useMasterdataStyles from "@/styles/common/masterdata";
import Animated, { Easing, FadeIn, FadeOut } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/stores";
import { DragsubformProps } from "@/typing/screens/CreateForm";

FadeIn.duration(300).easing(Easing.ease);
FadeOut.duration(300).easing(Easing.ease);

const Dragsubform = React.memo(({ checkLists }: DragsubformProps) => {
    const state = useSelector((state: any) => state.form);
    const dispatch = useDispatch<AppDispatch>();

    const [initialDialog, setInitialDialog] = useState(false);
    const [initialSubForm, setInitialSubForm] = useState<BaseSubForm>({
        SFormID: "",
        SFormName: "",
        FormID: "",
        Number: false,
        MachineID: "",
        Fields: [],
    });
    const [editMode, setEditMode] = useState(false);

    const masterdataStyles = useMasterdataStyles();
    const { fontSize, spacing } = useRes();
    const { theme } = useTheme();
    const createform = useCreateformStyle();
    const { handleError } = useToast();

    const handleDropSubForm = (data: Omit<BaseSubForm, "DisplayOrder">[]) => {
        dispatch(setDragSubForm({ data }));
    };

    const handelSetDialog = useCallback(() => {
        setEditMode(false);
        setInitialDialog(false);
    }, []);

    const handelSubForm = useCallback((item?: BaseSubForm) => {
        setInitialSubForm(
            item || {
                SFormID: "",
                SFormName: "",
                FormID: "",
                Number: false,
                MachineID: "",
                Fields: [],
            }
        );
    }, []);

    const handelSaveSubForm = useCallback(
        (values: BaseSubForm, mode: string) => {
            const payload = { subForm: values };

            try {
                if (mode === "add") {
                    dispatch(addSubForm(payload));
                } else if (mode === "update") {
                    dispatch(updateSubForm(payload));
                }
            } catch (error) {
                handleError(error);
            } finally {
                handelSetDialog();
            }
        },
        [dispatch, handleError, handelSetDialog]
    );

    const onPressEdit = useCallback(
        (item: BaseSubForm) => {
            setEditMode(true);
            setInitialDialog(true);
            handelSubForm(item);
        },
        [handelSubForm]
    );

    const RowItem = React.memo(({ item, drag, isActive, getIndex }: RowItemProps<BaseSubForm>) => {
        return (
            <>
                <TouchableOpacity
                    onPress={() => onPressEdit(item)}
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        createform.subFormContainer,
                        { backgroundColor: item.Open ? "#e9e9e9" : undefined },
                        isActive ? createform.active : null,
                    ]}
                    testID={`dg-SF-${item.SFormID}`}
                >
                    <IconButton
                        icon={"folder-edit-outline"}
                        iconColor={theme.colors.onBackground}
                        size={spacing.large}
                        style={createform.icon}
                        animated
                    />
                    <Text
                        style={[masterdataStyles.text, styles.rowtext]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.SFormName}
                    </Text>
                    <IconButton
                        icon={item.Open ? "chevron-up" : "chevron-down"}
                        iconColor={theme.colors.onBackground}
                        size={spacing.large}
                        style={createform.icon}
                        onPress={() => dispatch(setOpen({ subForm: item }))}
                        animated
                    />
                </TouchableOpacity>

                {item.Open && (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Dragfield
                            data={item.Fields ?? []}
                            SFormID={item.SFormID}
                            Columns={item.Columns}
                            dispatch={dispatch}
                            checkLists={checkLists}
                        />
                    </Animated.View>
                )}
            </>
        );
    });

    const renderSubForm = useCallback(
        (params: RenderItemParams<BaseSubForm>) => (
            <ShadowDecorator>
                <ScaleDecorator activeScale={0.9}>
                    <RowItem {...params} />
                </ScaleDecorator>
            </ShadowDecorator>
        ),
        [RowItem]
    );

    const styles = StyleSheet.create({
        container: {
            flexDirection: "row",
            marginTop: 20,
            justifyContent: "space-between",
            marginHorizontal: 30,
            borderBottomWidth: 0.5,
            borderColor: '#eaeaea',
        },
        cardtext: {
            marginLeft: 8,
            paddingVertical: 10,
            alignContent: "center",
        },
        nestable: {
            paddingHorizontal: fontSize === "large" ? 30 : 25,
            paddingTop: 5,
            paddingBottom: state.subForms.length > 0 ? 20 : 0,
        },
        rowtext: {
            textAlign: "left",
            flex: 1,
            paddingLeft: 5,
        },
    });

    return (
        <>
            <View style={styles.container}>
                <Text style={[masterdataStyles.cardTitle]}>All Cards</Text>
                <IconButton
                    icon="folder-plus-outline"
                    iconColor={theme.colors.onBackground}
                    size={spacing.large}
                    style={createform.icon}
                    onPress={() => {
                        setInitialDialog(true);
                        handelSubForm();
                    }}
                    animated
                />
            </View>

            <NestableScrollContainer style={styles.nestable}>
                <NestableDraggableFlatList
                    data={state.subForms}
                    renderItem={renderSubForm}
                    keyExtractor={(item) => item.SFormID}
                    onDragEnd={({ data }) => handleDropSubForm(data)}
                    getItemLayout={(data, index) => ({ length: 60, offset: 60 * index, index })}
                    activationDistance={10}
                />

                <TouchableOpacity
                    onPress={() => {
                        setInitialDialog(true);
                        handelSubForm();
                    }}
                    style={createform.subFormContainer}
                >
                    <IconButton icon="folder-plus-outline" iconColor={theme.colors.onBackground} size={spacing.large} style={createform.icon} animated />
                    <Text style={[masterdataStyles.text, { marginLeft: 8, paddingVertical: 10 }]}>Add Card</Text>
                </TouchableOpacity>
            </NestableScrollContainer>

            {initialDialog && (
                <SubFormDialog
                    isVisible={initialDialog}
                    setIsVisible={handelSetDialog}
                    isEditing={editMode}
                    initialValues={initialSubForm}
                    saveData={handelSaveSubForm}
                    onDelete={(SFormID: string) => {
                        dispatch(deleteSubForm({ SFormID }));
                        handelSetDialog();
                    }}
                />
            )}
        </>
    );
});

export default Dragsubform;
