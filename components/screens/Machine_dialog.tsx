import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, ScrollView, View, ActivityIndicator, StyleSheet } from "react-native";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog, TextInput } from "react-native-paper";
import { Formik, FastField } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { MachineDialogProps, InitialValuesMachine } from '@/typing/value'
import { GroupMachine } from '@/typing/type'
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import QRCode from "react-native-qrcode-svg";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Platform } from "react-native";
import { useInfiniteQuery, useQuery } from "react-query";
import { fetchMachineGroups, fetchSearchMachineGroups } from "@/app/services";
import DropDownPicker from "react-native-dropdown-picker";

const validationSchema = Yup.object().shape({
    machineGroupId: Yup.string().required("The group machine field is required."),
    machineCode: Yup.string().max(15, 'Machine code must not exceed 15 characters.'),
    machineName: Yup.string().required("The machine name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The status field is required."),
});

const Machine_dialog = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData }: MachineDialogProps<InitialValuesMachine>) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    const { responsive } = useRes()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [items, setItems] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

    const {
        data,
        isFetching,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery(
        ['machineGroups', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchMachineGroups(debouncedSearchQuery)
                : fetchMachineGroups(pageParam, 100);
        },
        {
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 100 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().map((item) => ({
                    label: item.GMachineName || 'Unknown',
                    value: item.GMachineID || '',
                }));

                setItems((prevItems) => {
                    const newItemsSet = new Set(prevItems.map(item => item.value));
                    newData.pages.flat().forEach(item => {
                        if (!newItemsSet.has(item.GMachineID)) {
                            newItemsSet.add(item.GMachineID);
                            prevItems.push({ label: item.GMachineName || 'Unknown', value: item.GMachineID });
                        }
                    });
                    return [...prevItems];
                });
            },
        }
    );

     useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedSearchQuery(searchQuery);
        }, 300);
    
        return () => {
          clearTimeout(handler);
        };
      }, [searchQuery]);
    

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setItems([]);
    };

    const handleScroll = (event: any) => {
        const contentHeight = event.nativeEvent.contentSize.height;
        const layoutHeight = event.nativeEvent.layoutMeasurement.height;
        const offsetY = event.nativeEvent.contentOffset.y;

        if (
            contentHeight - layoutHeight - offsetY <= 0 &&
            hasNextPage &&
            !isFetching
        ) {
            fetchNextPage();
        }
    };

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={[masterdataStyles.containerDialog, { width: responsive === "large" ? 1000 : "80%" }]} testID="dialog-md">
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-md">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>
                    <Text
                        style={[masterdataStyles.text, { paddingLeft: 10 }]}
                    >
                        {isEditing ? "Edit the details of the machine." : "Enter the details for the new machine."}
                    </Text>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesMachine) => saveData(values)}
                        >
                            {({ values, handleSubmit, setFieldValue, dirty, isValid }) => (
                                <View id="form-md" style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: values.machineId ? 1 : undefined }}>
                                        <ScrollView
                                            contentContainerStyle={{ marginTop: '15%', paddingBottom: 5, paddingHorizontal: 10 }}
                                            showsVerticalScrollIndicator={false}
                                        >
                                            {values.machineId ? (
                                                <View style={{ flexGrow: 1, alignItems: 'center' }}>
                                                    <QRCode
                                                        value={values.machineId || "No input"}
                                                        size={180}
                                                        color="black"
                                                        backgroundColor="white"
                                                        logoBorderRadius={5}
                                                        logoMargin={20}
                                                    />
                                                    <Text
                                                        style={[masterdataStyles.textQR, { marginVertical: 10 }]}
                                                    >
                                                        Scan this code for open form.
                                                    </Text>
                                                    <TextInput
                                                        mode="outlined"
                                                        value={values.machineId}
                                                        contentStyle={{ borderRadius: 10 }}
                                                        style={[masterdataStyles.text, { width: '70%', backgroundColor: theme.colors.background }]}
                                                    />
                                                </View>
                                            ) : false}
                                        </ScrollView>
                                    </View>

                                    <View style={{ flex: 2, flexGrow: 2, maxHeight: hp(Platform.OS === "web" ? '50%' : '70&') }}>
                                        <ScrollView
                                            contentContainerStyle={{ paddingBottom: 5, paddingHorizontal: 10 }}
                                            showsVerticalScrollIndicator={false}
                                        >
                                            <FastField name="machineGroupId">
                                                {({ field, form }: any) => {

                                                    const handleChange = (value: any) => {
                                                        const stringValue = (value as { value: string }).value;

                                                        form.setFieldValue(field.name, stringValue);

                                                        if (timeoutRef.current) {
                                                            clearTimeout(timeoutRef.current);
                                                        }

                                                        timeoutRef.current = setTimeout(() => form.setFieldTouched(field.name, true), 0);
                                                    };

                                                    return (
                                                        <>
                                                            <DropDownPicker
                                                                mode="SIMPLE"
                                                                maxHeight={300}
                                                                setOpen={() => { }}
                                                                open={open}
                                                                value={selectedValue}
                                                                items={items}
                                                                setValue={setSelectedValue}
                                                                placeholder="Search for a machine group..."
                                                                containerStyle={styles.dropdownContainer}
                                                                loading={isFetching}
                                                                style={styles.dropDownStyle}
                                                                listMode="SCROLLVIEW"
                                                                searchable={true}
                                                                searchPlaceholder="Search for a machine group..."
                                                                onChangeSearchText={handleSearch}
                                                                scrollViewProps={{
                                                                    onScroll: handleScroll,
                                                                }}
                                                                onOpen={() => setOpen(true)}
                                                                onClose={() => setOpen(false)}
                                                                searchTextInputStyle={styles.searchInput}  // เพิ่มสไตล์ให้กับช่องค้นหา
                                                            />

                                                            {isFetching && items.length > 0 && (
                                                                <ActivityIndicator size="small" color="#007bff" style={styles.loader} />
                                                            )}

                                                            {items.length === 0 && !isFetching && (
                                                                <Text style={styles.noResultsText}>No results found</Text>
                                                            )}
                                                        </>
                                                        // <CustomDropdownSingle
                                                        //     title="Group Machine"
                                                        //     labels="GMachineName"
                                                        //     values="GMachineID"
                                                        //     data={!isEditing ? machineGroups?.filter((v) => v.IsActive) : machineGroups || []}
                                                        //     value={field.value}
                                                        //     handleChange={handleChange}
                                                        //     handleBlur={() => {
                                                        //         form.setFieldTouched(field.name, true);
                                                        //     }}
                                                        //     testId="machineGroupId-md"
                                                        //     error={form.touched.machineGroupId && Boolean(form.errors.machineGroupId)}
                                                        //     errorMessage={form.touched.machineGroupId ? form.errors.machineGroupId : ""}
                                                        // />
                                                    )
                                                }}
                                            </FastField>

                                            <FastField name="machineName">
                                                {({ field, form }: any) => (
                                                    <Inputs
                                                        placeholder="Enter Machine Name"
                                                        label="Machine Name"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={field.value}
                                                        error={form.touched.machineName && Boolean(form.errors.machineName)}
                                                        errorMessage={form.touched.machineName ? form.errors.machineName : ""}
                                                        testId="machineName-md"
                                                    />
                                                )}
                                            </FastField >

                                            <FastField name="machineCode">
                                                {({ field, form }: any) => (
                                                    <Inputs
                                                        placeholder="Enter machine Code"
                                                        label="Machine Code"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={field.value}
                                                        error={form.touched.machineCode && Boolean(form.errors.machineCode)}
                                                        errorMessage={form.touched.machineCode ? form.errors.machineCode : ""}
                                                        testId="machineCode-md"
                                                    />
                                                )}
                                            </FastField>

                                            <FastField name="description">
                                                {({ field, form }: any) => (
                                                    <Inputs
                                                        placeholder="Enter Description"
                                                        label="Description"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={field.value}
                                                        error={form.touched.description && Boolean(form.errors.description)}
                                                        errorMessage={form.touched.description ? form.errors.description : ""}
                                                        testId="description-md"
                                                    />
                                                )}
                                            </FastField>

                                            <FastField name="building">
                                                {({ field, form }: any) => (
                                                    <Inputs
                                                        placeholder="Enter Building"
                                                        label="Building"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={field.value}
                                                        error={form.touched.building && Boolean(form.errors.building)}
                                                        errorMessage={form.touched.building ? form.errors.building : ""}
                                                        testId="building-md"
                                                    />
                                                )}
                                            </FastField>

                                            <FastField name="floor">
                                                {({ field, form }: any) => (
                                                    <Inputs
                                                        placeholder="Enter Floor"
                                                        label="Floor"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={field.value}
                                                        error={form.touched.floor && Boolean(form.errors.floor)}
                                                        errorMessage={form.touched.floor ? form.errors.floor : ""}
                                                        testId="floor-md"
                                                    />
                                                )}
                                            </FastField>

                                            <FastField name="area">
                                                {({ field, form }: any) => (
                                                    <Inputs
                                                        placeholder="Enter Area"
                                                        label="Area"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={field.value}
                                                        error={form.touched.area && Boolean(form.errors.area)}
                                                        errorMessage={form.touched.area ? form.errors.area : ""}
                                                        testId="area-md"
                                                    />
                                                )}
                                            </FastField>


                                            <View id="form-active-md" style={masterdataStyles.containerSwitch}>
                                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                                    <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                                        Status: {values.isActive ? "Active" : "Inactive"}
                                                    </Text>
                                                    <Switch
                                                        style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                        color={values.disables ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                        disabled={Boolean(values.disables)}
                                                        value={values.isActive}
                                                        onValueChange={(v: boolean) => {
                                                            setFieldValue("isActive", v);
                                                        }}
                                                        testID="isActive-md"
                                                    />
                                                </View>
                                            </View>

                                        </ScrollView>
                                        <View id="form-action-md" style={masterdataStyles.containerAction}>
                                            <TouchableOpacity
                                                onPress={() => handleSubmit()}
                                                disabled={!isValid || !dirty}
                                                style={[
                                                    masterdataStyles.button,
                                                    masterdataStyles.backMain,
                                                    { opacity: isValid && dirty ? 1 : 0.5 }
                                                ]}
                                                testID="Save-md"
                                            >
                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-md">
                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                </View>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
})

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',  // เพิ่มสีพื้นหลังให้กับ container
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',  // สีของข้อความ title
        textAlign: 'center',  // จัดข้อความให้อยู่กลาง
    },
    loader: {
        marginTop: 10,
    },
    dropdownContainer: {
        width: '100%',
        marginBottom: 20,  // เพิ่มระยะห่างด้านล่าง
    },
    dropDownStyle: {
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 10,  // เพิ่ม padding ด้านใน
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',  // ใช้ boxShadow แทน shadow properties
        elevation: 3,  // เพิ่มเงาให้กับ Android
    },
    searchInput: {
        backgroundColor: '#f9f9f9',  // เพิ่มสีพื้นหลังให้ช่องค้นหา
        borderRadius: 8,  // ทำให้มุมของช่องค้นหานุ่มนวล
        borderWidth: 1,
        borderColor: '#ddd',
        paddingLeft: 10,
        height: 40,  // เพิ่มความสูงให้ช่องค้นหา
        fontSize: 16,  // ขยายขนาดตัวอักษรให้ใหญ่ขึ้น
    },
    noResultsText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,  // เพิ่มระยะห่างด้านบน
    },
});


export default Machine_dialog