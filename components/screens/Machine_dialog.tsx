import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog, HelperText } from "react-native-paper";
import { Formik, Field } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";

const validationSchema = Yup.object().shape({
    machineGroupId: Yup.string().required("The machine group field is required."),
    machineName: Yup.string().required("The machine name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

interface InitialValues {
    machineGroupId?: string;
    machineId: string;
    machineName: string;
    description: string;
    isActive: boolean;
}

interface MachineGroup {
    MGroupID: string;
    MGroupName: string;
    Description: string;
    IsActive: boolean;
}

interface Machine_dialogProps {
    isVisible: boolean;
    setIsVisible: (v: boolean) => void;
    isEditing: boolean;
    initialValues: InitialValues;
    saveData: (values: InitialValues) => void;
    machineGroup: MachineGroup[];
    dropmachine: MachineGroup[];
}

const Machine_dialog: React.FC<Machine_dialogProps> = ({ isVisible, setIsVisible, isEditing, initialValues, saveData, dropmachine, machineGroup }) => {

    const masterdataStyles = useMasterdataStyles()
    const { colors } = useTheme()

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog}>
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]}>
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={saveData}
                        >
                            {({ handleChange, handleBlur, values, errors, touched, handleSubmit, setFieldValue, dirty, isValid }) => (
                                <AccessibleView>
                                    <Field
                                        name="machineGroupId"
                                        component={({ field, form }: any) => (
                                            <AccessibleView style={masterdataStyles.containerInput}>
                                                <CustomDropdownSingle
                                                    title="Machine Group"
                                                    labels="MGroupName"
                                                    values="MGroupID"
                                                    data={!isEditing
                                                        ? machineGroup.filter((v) => v.IsActive)
                                                        : dropmachine}
                                                    selectedValue={field.value}
                                                    onValueChange={(value, icon) => {
                                                        console.log(value);

                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                />
                                                {touched.machineGroupId && errors.machineGroupId && (
                                                    <HelperText type="error" visible={Boolean(touched.machineGroupId && errors.machineGroupId)} style={{ left: -10 }}>
                                                        {errors.machineGroupId}
                                                    </HelperText>
                                                )}
                                            </AccessibleView>
                                        )}
                                    />

                                    <Inputs
                                        placeholder="Enter Machine Group Name"
                                        label="Machine Group Name"
                                        handleChange={handleChange("machineName")}
                                        handleBlur={handleBlur("machineName")}
                                        value={values.machineName}
                                        error={touched.machineName && Boolean(errors.machineName)}
                                        errorMessage={touched.machineName ? errors.machineName : ""}
                                    />
                                    <Inputs
                                        placeholder="Enter Description"
                                        label="Description"
                                        handleChange={handleChange("description")}
                                        handleBlur={handleBlur("description")}
                                        value={values.description}
                                        error={touched.description && Boolean(errors.description)}
                                        errorMessage={touched.description ? errors.description : ""}
                                    />
                                    <AccessibleView style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.isActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            color={values.isActive ? colors.succeass : colors.disable}
                                            value={values.isActive}
                                            onValueChange={(v: boolean) => {
                                                setFieldValue("isActive", v);
                                            }}
                                        />
                                    </AccessibleView>
                                    <AccessibleView style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis,
                                            ]}
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Save</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]}>
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Cancel</Text>
                                        </Pressable>
                                    </AccessibleView>
                                </AccessibleView>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

export default Machine_dialog