import React, { useRef } from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import CustomDropdownMultiple from "@/components/CustomDropdownMultiple";
import { Portal, Switch, Dialog, HelperText } from "react-native-paper";
import { Formik, Field } from "formik";
import * as Yup from 'yup';
import useMasterdataStyles from "@/styles/common/masterdata";
import { CheckListOption, GroupCheckListOption } from '@/typing/type';
import { InitialValuesMatchCheckListOption, MatchChecklistOptionProps } from '@/typing/value';
import { IMultiSelectRef } from "react-native-element-dropdown";

const validationSchema = Yup.object().shape({
    groupCheckListOptionId: Yup.string().required("This group check list field is required"),
    checkListOptionId: Yup.array()
        .of(Yup.string())
        .min(1, "The check list option field requires at least one option to be selected"),
    isActive: Yup.boolean().required("The active field is required."),
});

const Match_checklist_option = ({
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
    const { colors } = useTheme();
    const multiSelectRef = useRef<IMultiSelectRef>(null);

    if (multiSelectRef.current?.close) {
        const selectedValues = multiSelectRef.current.getSelectedValues();
        console.log("Selected Values: ", selectedValues);
    }
    
    const handleShowSelectedValues = () => {
        if (multiSelectRef.current?.close) {
            const selectedValues = multiSelectRef.current.getSelectedValues();
            console.log("Selected Values: ", selectedValues);
        }
    };

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog} testID="dialog-mcod">
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-mcod">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={(values: InitialValuesMatchCheckListOption) => saveData(values)}
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
                                                    onValueChange={(value) => {
                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                    testId="groupCheckListOptionId-mcod"
                                                />
                                                {touched.groupCheckListOptionId && errors.groupCheckListOptionId && (
                                                    <HelperText type="error" visible={Boolean(touched.groupCheckListOptionId && errors.groupCheckListOptionId)} style={{ left: -10 }} testID="error-groupCheckListOptionId-mcod">
                                                        {errors.groupCheckListOptionId}
                                                    </HelperText>
                                                )}
                                            </AccessibleView>
                                        )}
                                    />
                                    <Text onPress={handleShowSelectedValues}>Show Selected Values</Text>
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
                                                    onValueChange={(value) => {
                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                    testId="checkListOptionId-mcod"
                                                    ref={multiSelectRef}
                                                />
                                                {touched.checkListOptionId && errors.checkListOptionId && (
                                                    <HelperText type="error" visible={Boolean(touched.checkListOptionId && errors.checkListOptionId)} style={{ left: -10 }} testID="error-checkListOptionId-mcod">
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
                                            testID="isActive-mcod"
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
                                            testID="Save-mcod"
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold]}>Save</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-mcod">
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
    );
};

export default Match_checklist_option;
