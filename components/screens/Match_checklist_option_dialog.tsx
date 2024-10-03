import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import CustomDropdownMultiple from "@/components/CustomDropdownMultiple";
import { Portal, Switch, Dialog, HelperText } from "react-native-paper";
import { Formik, Field } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";

const validationSchema = Yup.object().shape({
    groupCheckListOptionId: Yup.string().required(
        "This group check list field is required"
    ),
    checkListOptionId: Yup.array()
        .of(Yup.string())
        .min(1, "The check list option field requires at least one option to be selected"),
    isActive: Yup.boolean().required("The active field is required."),
});

interface InitialValues {
    matchCheckListOptionId: string;
    checkListOptionId: string[];
    groupCheckListOptionId: string;
    isActive: boolean;
}

interface GroupCheckListOption {
    GCLOptionID: string;
    GCLOptionName: string;
    IsActive: boolean;
}

interface CheckListOption {
    CLOptionID: string;
    CLOptionName: string;
    IsActive: boolean;
}

interface Match_checklist_optionProps {
    isVisible: boolean;
    setIsVisible: (v: boolean) => void;
    isEditing: boolean;
    initialValues: InitialValues;
    saveData: (values: InitialValues) => void;
    checkListOption: CheckListOption[];
    dropcheckListOption: CheckListOption[];
    groupCheckListOption: GroupCheckListOption[];
    dropgroupCheckListOption: GroupCheckListOption[];
}

const Match_checklist_option: React.FC<Match_checklist_optionProps> = ({ isVisible, setIsVisible, isEditing, initialValues, saveData,
    checkListOption,
    dropcheckListOption,
    groupCheckListOption,
    dropgroupCheckListOption, }) => {

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
                                        name="groupCheckListOptionId"
                                        component={({ field, form }: any) => (
                                            <AccessibleView style={masterdataStyles.containerInput}>
                                                <CustomDropdownSingle
                                                    title="Group Check List Option"
                                                    labels="GCLOptionName"
                                                    values="GCLOptionID"
                                                    data={!isEditing
                                                        ? groupCheckListOption.filter((v) => v.IsActive)
                                                        : dropgroupCheckListOption}
                                                    selectedValue={field.value}
                                                    onValueChange={(value, icon) => {
                                                        console.log(value);

                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                />
                                                {touched.groupCheckListOptionId && errors.groupCheckListOptionId && (
                                                    <HelperText type="error" visible={Boolean(touched.groupCheckListOptionId && errors.groupCheckListOptionId)} style={{ left: -10 }}>
                                                        {errors.groupCheckListOptionId}
                                                    </HelperText>
                                                )}
                                            </AccessibleView>
                                        )}
                                    />

                                    <Field
                                        name="checkListOptionId"
                                        component={({ field, form }: any) => (
                                            <AccessibleView style={masterdataStyles.containerInput}>
                                                <CustomDropdownMultiple
                                                    title="Check List Option"
                                                    labels="CLOptionName"
                                                    values="CLOptionID"
                                                    data={!isEditing
                                                        ? checkListOption.filter((v) => v.IsActive)
                                                        : dropcheckListOption}
                                                    selectedValue={field.value}
                                                    onValueChange={(value, icon) => {
                                                        console.log(value);

                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                />
                                                {touched.checkListOptionId && errors.checkListOptionId && (
                                                    <HelperText type="error" visible={Boolean(touched.checkListOptionId && errors.groupCheckListOptionId)} style={{ left: -10 }}>
                                                        {errors.checkListOptionId}
                                                    </HelperText>
                                                )}
                                            </AccessibleView>
                                        )}
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

export default Match_checklist_option