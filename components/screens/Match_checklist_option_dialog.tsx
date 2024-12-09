import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import CustomDropdownMultiple from "@/components/CustomDropdownMultiple";
import { Portal, Switch, Dialog } from "react-native-paper";
import { Formik, FastField } from "formik";
import * as Yup from 'yup';
import useMasterdataStyles from "@/styles/common/masterdata";
import { CheckListOption, GroupCheckListOption } from '@/typing/type';
import { InitialValuesMatchCheckListOption, MatchChecklistOptionProps } from '@/typing/value';
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";

const validationSchema = Yup.object().shape({
    groupCheckListOptionId: Yup.string().required("This group check list field is required"),
    checkListOptionId: Yup.array()
        .of(Yup.string())
        .min(1, "The check list option field requires at least one option to be selected"),
    isActive: Yup.boolean().required("The active field is required."),
});

const Match_checklist_option = React.memo(({
    isVisible,
    setIsVisible,
    isEditing,
    initialValues,
    saveData,
    checkListOption,
    dropcheckListOption,
    groupCheckListOption,
    dropgroupCheckListOption,
}: MatchChecklistOptionProps<InitialValuesMatchCheckListOption, CheckListOption, GroupCheckListOption>) => {
    const masterdataStyles = useMasterdataStyles();
    const { theme } = useTheme()
    const filteredData = useMemo(() => {
        return !isEditing ? checkListOption.filter((v) => v.IsActive) : dropcheckListOption;
    }, [isEditing, checkListOption, dropcheckListOption]);

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog} testID="dialog-mcod">
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-mcod">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>

                    <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}>
                        {isEditing
                            ? "Edit the details of the match check list option & group check list option."
                            : "Enter the details for the match check list option & group check list option."}
                    </Text>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesMatchCheckListOption) => saveData(values)}
                        >
                            {({ values, errors, touched, handleSubmit, setFieldValue, dirty, isValid }) => (
                                <View id="form-mcod">

                                    <FastField name="groupCheckListOptionId">
                                        {({ field, form }: any) => (
                                            <CustomDropdownSingle
                                                title="Group Check List Option"
                                                labels="GCLOptionName"
                                                values="GCLOptionID"
                                                data={!isEditing
                                                    ? groupCheckListOption.filter((v) => v.IsActive)
                                                    : dropgroupCheckListOption}
                                                value={field.value}
                                                handleChange={(value) => {
                                                    const stringValue = (value as { value: string }).value;
                                                    form.setFieldValue(field.name, stringValue);
                                                    setTimeout(() => {
                                                        form.setFieldTouched(field.name, true);
                                                    }, 0);
                                                }}
                                                handleBlur={() => {
                                                    form.setFieldTouched(field.name, true);
                                                }}
                                                testId="groupCheckListOptionId-mcod"
                                                error={form.touched.groupCheckListOptionId && Boolean(form.errors.groupCheckListOptionId)}
                                                errorMessage={form.touched.groupCheckListOptionId ? form.errors.groupCheckListOptionId : ""}
                                            />
                                        )}
                                    </FastField>

                                    <FastField name="checkListOptionId">
                                        {({ field, form }: any) => (
                                            <CustomDropdownMultiple
                                                title="Check List Option"
                                                labels="CLOptionName"
                                                values="CLOptionID"
                                                data={filteredData}
                                                value={field.value}
                                                handleChange={(value) => {
                                                    form.setFieldValue(field.name, value);
                                                    setTimeout(() => {
                                                        form.setFieldTouched(field.name, true);
                                                    }, 0)
                                                }}
                                                handleBlur={() => {
                                                    form.setFieldTouched(field.name, true);
                                                }}
                                                testId="checkListOptionId-mcod"
                                                error={form.touched.checkListOptionId && Boolean(form.errors.checkListOptionId)}
                                                errorMessage={form.touched.checkListOptionId ? form.errors.checkListOptionId : ""}
                                            />
                                        )}
                                    </FastField>

                                    <View id="form-active-mcod" style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.isActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            color={values.disables ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                            value={values.isActive}
                                            disabled={Boolean(values.disables)}
                                            onValueChange={(v: boolean) => {
                                                setFieldValue("isActive", v);
                                            }}
                                            testID="isActive-mcod"
                                        />
                                    </View>
                                    <View id="form-action-mcod" style={masterdataStyles.containerAction}>
                                        <TouchableOpacity
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                masterdataStyles.backMain,
                                                { opacity: isValid && dirty ? 1 : 0.5 }
                                            ]}
                                            testID="Save-mcod"
                                        >
                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Save</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-mcod">
                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
});

export default Match_checklist_option;
