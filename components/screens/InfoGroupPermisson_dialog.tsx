import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import useMasterdataStyles from "@/styles/common/masterdata";
import { GroupUsers } from "@/typing/type";
import { FastField, Field, Formik } from "formik";
import React, { lazy, Suspense, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Card, Dialog, Icon, IconButton, List, Switch, Text } from "react-native-paper";
import CustomDropdownSingle from "../CustomDropdownSingle";
import { LoadingSpinner } from "../common";

const LazyGroupUserCreate_dialog = lazy(() => import("../screens/GroupUserCreate_dialog"));

const CustomDialog = React.memo(({ visible, onDismiss, children }: { visible: boolean, onDismiss: () => void; children: any }) => {
    const { responsive } = useRes();
    const { theme } = useTheme();

    return <Dialog
        visible={visible}
        onDismiss={() => onDismiss()}
        style={{ zIndex: 3, width: responsive === "large" ? 550 : "60%", alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 4, backgroundColor: theme.colors.background }}
    >
        {children}
    </Dialog>
});

const InfoGroupPermisson_dialog = React.memo(({ setDialogAdd, groupUsers, saveGroupUsers, savePermisson, selected, mode, deleteF }: { setDialogAdd: () => void, groupUsers: GroupUsers[], saveGroupUsers: (v: any) => void, savePermisson: (v: any) => void, selected?: string, mode?: boolean, deleteF: (value: string) => void }) => {
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes();
    const { theme } = useTheme();
    const [addDialog, setAddDialog] = useState(false)

    const [selectedGroupUser, setSelectedGroupUser] = useState<GroupUsers | null>(null);

    const [initialValues, setInitialValues] = useState<{ GUserID?: string; GUserName: string; isActive: boolean; }>({
        GUserID: "",
        GUserName: "",
        isActive: true
    });

    const styles = StyleSheet.create({
        button: {
            alignSelf: 'flex-end',
            paddingHorizontal: 20,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.drag,
            borderRadius: 4,
        },
        buttonSubmit: {
            backgroundColor: theme.colors.green,
            marginRight: 5,
            flexDirection: "row"
        },
        containerAction: {
            justifyContent: "flex-end",
            flexDirection: 'row',
            paddingRight: 20,
            marginVertical: 10
        },
        dialog: {
            borderRadius: 10,
            paddingVertical: 10,
        },
        title: {
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
        },
        optionItem: {
            paddingVertical: 5,
        },
        noOptionsText: {
            color: "gray",
            textAlign: "center",
            marginVertical: 10,
        },
        actionButton: {
            padding: 10,
            marginHorizontal: 5,
        },
    });

    return (
        <>
            <GestureHandlerRootView style={{ flexGrow: 1 }}>
                <View style={{ justifyContent: "space-between", flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                        <Icon source="information-outline" size={spacing.large} color={theme.colors.green} />
                        <Text style={[masterdataStyles.title, masterdataStyles.textBold, { paddingLeft: 8 }]}>Group Permissions List</Text>
                    </View>
                    <IconButton icon="close" size={20} iconColor={theme.colors.black} onPress={() => setDialogAdd()} />
                </View>
                {mode ? (
                    <View style={[styles.dialog, { maxHeight: Platform.OS === "web" ? 400 : '68%' }]}>
                        <ScrollView style={{ marginHorizontal: 10 }}>
                            {groupUsers.length > 0 && selected ? (
                                groupUsers.find((item) => item.GUserID === selected)?.Permissions.map((op, index) => (
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'center', alignItems: 'center' }} key={index}>
                                        <Icon source="circle" size={spacing.medium} color={op.PermissionStatus ? theme.colors.succeass : theme.colors.error} />
                                        <List.Item
                                            title={op.PermissionName}
                                            style={styles.optionItem}
                                            descriptionStyle={{ fontSize: spacing.small }}
                                            titleStyle={{ fontSize: spacing.small }}
                                        />
                                    </View>
                                ))
                            ) : (
                                <Text style={masterdataStyles.text}>No options available</Text>
                            )}
                        </ScrollView>
                    </View>
                ) : (
                    <Formik
                        initialValues={{
                            GUserID: "", permissions: selectedGroupUser ? selectedGroupUser.Permissions.map((perm) => ({
                                PermissionID: perm.PermissionID,
                                PermissionName: perm.PermissionName,
                                PermissionStatus: perm.PermissionStatus || false
                            })) : []
                        }}
                        onSubmit={savePermisson}
                    >
                        {({ values, handleSubmit, setFieldValue }) => {
                            return (
                                <>
                                    <FastField name="GUserID" >
                                        {({ field, form }: any) => (
                                            <>
                                                <CustomDropdownSingle
                                                    title="Group User"
                                                    labels="GUserName"
                                                    values="GUserID"
                                                    data={groupUsers}
                                                    value={field.value}
                                                    handleChange={(value) => {
                                                        const stringValue = (value as { value: string }).value;
                                                        form.setFieldValue(field.name, stringValue);
                                                        setTimeout(() => {
                                                            form.setFieldTouched(field.name, true);
                                                            const selectedUser = groupUsers.find((user) => user.GUserID === stringValue);

                                                            if (selectedUser) {
                                                                setSelectedGroupUser(selectedUser);
                                                                form.setFieldValue("permissions", selectedUser.Permissions.map((perm) => ({
                                                                    PermissionID: perm.PermissionID,
                                                                    PermissionName: perm.PermissionName,
                                                                    PermissionStatus: perm.PermissionStatus || false
                                                                })));
                                                            }
                                                        }, 0);
                                                    }}
                                                    handleBlur={() => {
                                                        form.setFieldTouched(field.name, true);
                                                    }}
                                                    testId={`GUserID-managed`}
                                                />

                                                <View style={{ flexDirection: 'row', justifyContent: selectedGroupUser?.GUserID ? 'space-between' : 'flex-end', marginVertical: 5, marginHorizontal: 10, marginBottom: 10 }}>
                                                    {selectedGroupUser?.GUserID && (
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                setAddDialog(true)
                                                                const select = groupUsers.find((item) => item.GUserID === selectedGroupUser?.GUserID)

                                                                setInitialValues({
                                                                    GUserID: select?.GUserID,
                                                                    GUserName: select?.GUserName || "",
                                                                    isActive: select?.IsActive || false
                                                                })
                                                            }}
                                                            style={styles.button}
                                                        >
                                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                                                Edit
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}

                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setAddDialog(true)
                                                            setInitialValues({
                                                                GUserID: "",
                                                                GUserName: "",
                                                                isActive: true
                                                            })
                                                        }}
                                                        style={styles.button}
                                                    >
                                                        <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                                            Add Group User
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        )}
                                    </FastField>

                                    <ScrollView
                                        showsVerticalScrollIndicator={false}
                                        style={{ maxHeight: Platform.OS === "web" ? 330 : '48%' }}
                                        keyboardShouldPersistTaps="handled"
                                        nestedScrollEnabled={true}
                                    >
                                        {values.GUserID && values.permissions && values.permissions.length > 0 ? (
                                            values.permissions.map((op, index) => (
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 5, paddingRight: 30 }} key={op.PermissionID}>
                                                    <List.Item
                                                        title={op.PermissionName}
                                                        style={styles.optionItem}
                                                        descriptionStyle={{ fontSize: spacing.small }}
                                                        titleStyle={{ fontSize: spacing.small }}
                                                    />
                                                    <Switch
                                                        style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                        color={theme.colors.inversePrimary}
                                                        value={op.PermissionStatus}
                                                        onValueChange={(v: boolean) => {
                                                            setFieldValue(`permissions[${index}].PermissionStatus`, v);
                                                        }}
                                                        testID="IsActive-managed"
                                                        id="IsActive-managed-sw"
                                                    />
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={[masterdataStyles.text, { marginLeft: 10 }]}>No permissions available for this user.</Text>
                                        )}
                                    </ScrollView>

                                    <View style={[masterdataStyles.containerAction, styles.containerAction]}>
                                        {values.permissions && values.permissions.length > 0 && (
                                            <TouchableOpacity
                                                onPress={() => handleSubmit()}
                                                style={[styles.button, styles.buttonSubmit]}
                                            >
                                                <Icon source="check" size={spacing.large} color={theme.colors.fff} />
                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                    Update
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity
                                            onPress={() => setDialogAdd()}
                                            style={[styles.button, masterdataStyles.backMain, { marginLeft: 10, flexDirection: "row" }]}
                                        >
                                            <Icon source="close" size={spacing.large} color={theme.colors.fff} />
                                            <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            );
                        }}
                    </Formik>
                )}
            </GestureHandlerRootView >

            {addDialog && (
                <CustomDialog visible={addDialog} onDismiss={() => setAddDialog(false)}>
                    <Suspense fallback={<LoadingSpinner />}>
                        <LazyGroupUserCreate_dialog
                            initialValues={initialValues}
                            setIsVisible={() => {
                                setAddDialog(false);
                            }}
                            deleteF={(value: string) => {
                                deleteF(value)
                            }}
                            saveData={(value: any) => {
                                saveGroupUsers(value);
                                setAddDialog(false);
                            }}
                        />
                    </Suspense>
                </CustomDialog>
            )
            }
        </>

    );
});

export default InfoGroupPermisson_dialog;
