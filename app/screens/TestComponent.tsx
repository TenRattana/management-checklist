import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { NestableDraggableFlatList, NestableScrollContainer, RenderItemParams, ScaleDecorator, ShadowDecorator } from 'react-native-draggable-flatlist'
import useCreateformStyle from '@/styles/createform';
import { BaseFormState, BaseSubForm, RowItemProps, SubForm } from '@/typing/form';
import { IconButton } from 'react-native-paper';
import { useRes, useTheme } from '../contexts';
import { spacing } from "@/constants/Spacing";
import useForm from '@/hooks/custom/useForm';
import { CreateFormParams, Route } from '@/typing/tag';
import { runOnJS } from 'react-native-reanimated';
import { setDragSubForm, setField, setForm, setSubForm } from '@/slices';
import axiosInstance from '@/config/axios';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from 'expo-router';

const TestComponent = React.memo(() => {
    const createform = useCreateformStyle();
    const { theme } = useTheme()
    const { fontSize } = useRes()
    const [found, setFound] = useState<boolean>(false);
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.form);

    const createSubFormsAndFields = useCallback((formData: FormData, expectedResult?: { [key: string]: any }) => {
        const subForms: SubForm[] = [];
        const fields: BaseFormState[] = [];

        formData.SubForm?.forEach((item) => {
            const subForm: SubForm = {
                SFormID: item.SFormID,
                SFormName: item.SFormName,
                FormID: item.FormID,
                Columns: item.Columns,
                DisplayOrder: item.DisplayOrder,
                MachineID: item.MachineID,
                Fields: []
            };
            subForms.push(subForm);

            item.MatchCheckList?.forEach((itemOption) => {
                fields.push({
                    MCListID: itemOption.MCListID,
                    CListID: itemOption.CListID,
                    GCLOptionID: itemOption.GCLOptionID,
                    CTypeID: itemOption.CTypeID,
                    DTypeID: itemOption.DTypeID,
                    DTypeValue: itemOption.DTypeValue,
                    SFormID: itemOption.SFormID,
                    Required: itemOption.Required,
                    MinLength: itemOption.MinLength,
                    MaxLength: itemOption.MaxLength,
                    Placeholder: itemOption.Placeholder,
                    Hint: itemOption.Hint,
                    DisplayOrder: itemOption.DisplayOrder,
                    EResult: expectedResult?.[itemOption.MCListID] || "",
                });
            });
        });

        return { subForms, fields };
    }, []);

    const fetchForm = useCallback(async () => {
        try {
            let response;

            response = await axiosInstance.post("Form_service.asmx/GetForm", { FormID: "F00000002" });

            const status = response?.data?.status;
            const data = response?.data?.data?.[0] || null;

            setFound(status);

            return data;
        } catch (error) {
            setFound(false);
            return null;
        }
    }, []);

    const loadForm = useCallback(async () => {
        const formData = await fetchForm()
        if (formData) {
            setFound(true);

            const { subForms, fields } = createSubFormsAndFields(formData);

            const machineName = "M";
            formData['MachineName'] = machineName

            dispatch(setForm({ form: formData }));
            dispatch(setSubForm({ subForms }));
        } else {
            setFound(false);
        }
    }, [fetchForm]);

    useFocusEffect(
        useCallback(() => {
            loadForm();
        }, [loadForm])
    );

    const RowItem = ({ item, drag, isActive }: RowItemProps<BaseSubForm>) => {
        return (
            <>
                <Pressable
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        createform.subFormContainer,
                        isActive ? createform.active : null
                    ]}
                    testID={`dg-SF-${item.SFormID}`}
                >
                    <IconButton icon={"credit-card-plus"} iconColor={theme.colors.fff} size={spacing.large} style={createform.icon} animated />
                    <Text style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                        {item.SFormName}
                    </Text>
                    <IconButton icon="chevron-right" iconColor={theme.colors.fff} size={spacing.large} style={createform.icon} animated />
                </Pressable>
            </>
        );
    }

    const handleDropSubForm = (data: Omit<BaseSubForm, 'DisplayOrder'>[]) => {
        runOnJS(dispatch)(setDragSubForm({ data }));
    };


    const renderSubForm = useCallback((params: RenderItemParams<BaseSubForm>) => {
        return (
            <ShadowDecorator>
                <ScaleDecorator activeScale={0.90}>
                    <RowItem {...params} />
                </ScaleDecorator>
            </ShadowDecorator>
        );
    }, []);

    return (
        <View>
            <NestableScrollContainer
                style={{
                    paddingHorizontal: fontSize === "large" ? 30 : 25,
                    paddingTop: 5,
                    paddingBottom: state.subForms.length > 0 ? 20 : 0,
                }}
            >
                <NestableDraggableFlatList
                    data={state.subForms}
                    renderItem={renderSubForm}
                    keyExtractor={(item, index) => `SF-${item.SFormID}-${index}`}
                    onDragEnd={({ data }) => handleDropSubForm(data)}
                    activationDistance={10}
                    scrollEnabled={true}
                />
            </NestableScrollContainer>
        </View>
    )
})

export default TestComponent