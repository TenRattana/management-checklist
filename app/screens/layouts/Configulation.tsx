import { useRes, useTheme } from '@/app/contexts'
import { AccessibleView } from '@/components'
import useMasterdataStyles from '@/styles/common/masterdata'
import { useDispatch, useSelector } from "react-redux";
import { Formik, FastField, Field } from "formik";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Yup from 'yup'
import {
    setPrefixGroupMachine,
    setPrefixCheckList,
    setPrefixCheckListOption,
    setPrefixExpectedResult,
    setPrefixForm,
    setPrefixGroupCheckList,
    setPrefixLocation,
    setPrefixMachine,
    setPrefixMatchCheckListOption,
    setPrefixMatchFormMachine,
    setAppName
} from "@/slices";
import { Inputs } from '@/components';

import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, Text } from 'react-native-paper';

const RenderFormik = React.memo((field: string, setEdit: (v: boolean) => void) => {
    const dispatch = useDispatch()
    const state = useSelector((state: any) => state.prefix);
    const { spacing } = useRes();
    const { theme } = useTheme();

    return (
        <Formik
            initialValues={{ [field]: state[field] }}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={(values) => {
                dispatch(setAppName({ [field]: values[field] }));
                setEdit(false);
            }}
        >
            {({ handleSubmit, errors, touched, setFieldValue, setTouched, values }) => (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <View style={{ transform: [{ scale: 0.9 }], flexDirection: 'row', }}>

                        <Inputs
                            placeholder={`Enter ${field}`}
                            label={`${field}`}
                            handleChange={(value) => setFieldValue(field, value)}
                            handleBlur={() => setTouched({ ...touched, field: true })}
                            value={values[field]}
                            error={touched[field] && Boolean(errors[field])}
                            errorMessage={String(errors[field])}
                            testId={`${field}-cf`}
                        />
                        <IconButton icon="pencil-box" onPress={() => handleSubmit()} iconColor={theme.colors.blue} size={spacing.large + 5} style={{ alignSelf: 'center' }} animated />
                    </View>
                </Animated.View>
            )}
        </Formik>
    )
})

const Configulation = React.memo(() => {
    const state = useSelector((state: any) => state.prefix);
    const [edit, setEdit] = useState({ AppName: false, GroupMachine: false })
    const masterdataStyles = useMasterdataStyles()
    const { spacing } = useRes();
    const { theme } = useTheme();

    return (
        <AccessibleView name="setting" style={[masterdataStyles.container]}>
            <Text style={[masterdataStyles.textBold, masterdataStyles.text, { textAlign: 'center', paddingVertical: 30, fontSize: spacing.large }]}>Configulation</Text>

            <View id="config-app" style={[masterdataStyles.configPrefix]}>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant='labelMedium' style={[masterdataStyles.configPrefixText]}>Program Display : {" "}
                        {edit.AppName ?
                            <RenderFormik field="AppName" setEdit={(v: boolean) => setEdit(prev => ({ ...prev, AppName: v }))} />}
                    </Text>
                    <IconButton icon="pencil-box" onPress={() => setEdit(prev => ({ ...prev, AppName: true }))} iconColor={theme.colors.blue} size={spacing.large} style={{ display: edit.AppName ? 'none' : 'flex' }} animated />
                </View>
            </View>

            <View id="config-prefix" style={[masterdataStyles.configPrefix]}>
                <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>Fix Prefixs</Text>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant='labelMedium' style={[masterdataStyles.configPrefixText]}>Group Machines : {" "}
                        {edit.GroupMachine ? renderFormik("GroupMachine") : state.GroupMachine}
                    </Text>
                    <IconButton icon="pencil-box" onPress={() => setEdit(prev => ({ ...prev, GroupMachine: true }))} iconColor={theme.colors.blue} size={spacing.large} style={{ display: edit.GroupMachine ? 'none' : 'flex' }} animated />
                </View>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[masterdataStyles.configPrefixText]}>Machines : {state.Machine}</Text>
                    <IconButton icon="pencil-box" iconColor={theme.colors.blue} size={spacing.large} animated />
                </View>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[masterdataStyles.configPrefixText]}>Check List : {state.CheckList}</Text>
                    <IconButton icon="pencil-box" iconColor={theme.colors.blue} size={spacing.large} animated />
                </View>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[masterdataStyles.configPrefixText]}>Group Check List : {state.GroupCheckList}</Text>
                    <IconButton icon="pencil-box" iconColor={theme.colors.blue} size={spacing.large} animated />
                </View>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[masterdataStyles.configPrefixText]}>Option Check List : {state.CheckListOption}</Text>
                    <IconButton icon="pencil-box" iconColor={theme.colors.blue} size={spacing.large} animated />
                </View>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[masterdataStyles.configPrefixText]}>Match Check List Option : {state.MatchCheckListOption}</Text>
                    <IconButton icon="pencil-box" iconColor={theme.colors.blue} size={spacing.large} animated />
                </View>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[masterdataStyles.configPrefixText]}>Match Form Machine : {state.MatchFormMachine}</Text>
                    <IconButton icon="pencil-box" iconColor={theme.colors.blue} size={spacing.large} animated />
                </View>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[masterdataStyles.configPrefixText]}>Forms : {state.Form}</Text>
                    <IconButton icon="pencil-box" iconColor={theme.colors.blue} size={spacing.large} animated />
                </View>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[masterdataStyles.configPrefixText]}>Expected Result : {state.ExpectedResult}</Text>
                    <IconButton icon="pencil-box" iconColor={theme.colors.blue} size={spacing.large} animated />
                </View>
            </View>
        </AccessibleView>
    );
})

export default Configulation

const styles = StyleSheet.create({})