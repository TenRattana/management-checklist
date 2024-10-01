import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    LoadingSpinner,
    Inputs,
    Radios,
    Checkboxs,
    Textareas,
    Selects,
    AccessibleView,
} from "@/components";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { setSubForm, setField, setExpected, reset } from "@/slices";
import { useToast, useTheme, useRes } from "@/app/contexts";
import { useFocusEffect } from "@react-navigation/native";
import useMasterdataStyles from "@/styles/common/masterdata";
import { Divider } from "react-native-paper";
import { RootState } from "@/stores";

interface RouteParams {
    route: {
        params?: {
            formId?: string;
            tableId?: string;
        };
    };
}

interface Field {
    matchCheckListId: string;
    CheckListTypeName: string;
    placeholder?: string;
    hint?: string;
    CheckListName: string;
    groupCheckListOptionId?: string;
    displayOrder?: number;
    expectedResult?: string;
}

interface SubForm {
    subFormName: string;
    fields: Field[];
    columns: number;
}

interface GroupCheckListOption {
    GCLOptionID: string;
    CheckListOptions: { CLOptionID: string; CLOptionName: string }[];
}

const ViewFormScreen: React.FC<RouteParams> = ({ route }) => {
    const dispatch = useDispatch();
    const state = useSelector((state: RootState) => state.form);

    const [formData, setFormData] = useState<any[]>([]);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [checkList, setCheckList] = useState<any[]>([]);
    const [groupCheckListOption, setGroupCheckListOption] = useState<any[]>([]);
    const [checkListType, setCheckListType] = useState<any[]>([]);
    const [dataType, setDataType] = useState<any[]>([]);
    const { formId, tableId } = route.params || {};

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, showError } = useToast();
    const { colors } = useTheme();
    const { responsive, spacing } = useRes();

    const errorMessage = useCallback(
        (error: unknown) => {
            let errorMessage: string | string[];

            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.errors ?? ["Something went wrong!"];
            } else if (error instanceof Error) {
                errorMessage = [error.message];
            } else {
                errorMessage = ["An unknown error occurred!"];
            }

            showError(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
        },
        [showError]
    );

    const [vform, setVForm] = useState({
        formId: "",
        formName: "",
        description: "",
        machineId: "",
    });

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const [
                checkListResponse,
                groupCheckListOptionResponse,
                checkListTypeResponse,
                dataTypeResponse,
            ] = await Promise.all([
                axios.post("CheckList_service.asmx/GetCheckLists"),
                axios.post(
                    "GroupCheckListOption_service.asmx/GetGroupCheckListOptions"
                ),
                axios.post("CheckListType_service.asmx/GetCheckListTypes"),
                axios.post("DataType_service.asmx/GetDataTypes"),
            ]);

            setCheckList(checkListResponse.data.data ?? []);
            setGroupCheckListOption(groupCheckListOptionResponse.data.data ?? []);
            setCheckListType(checkListTypeResponse.data.data ?? []);
            setDataType(dataTypeResponse.data.data ?? []);
            setIsDataLoaded(true);
            setIsLoading(true);
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchForm = async () => {
        if (!isDataLoaded || (!formId && !tableId)) return;

        const requests = [];

        if (formId) {
            requests.push(axios.post("Form_service.asmx/GetForm", { FormID: formId }));
        }
        if (tableId) {
            requests.push(
                axios.post("ExpectedResult_service.asmx/GetExpectedResult", {
                    TableID: tableId,
                })
            );
        }

        try {
            const responses = await Promise.all(requests);
            const formResponse = formId ? responses[0] : null;
            const expectedResultResponse = tableId ? responses[1].data.data[0] : null;

            const formData = formResponse?.data?.data[0] || {};

            setVForm({
                formId: formData.FormID || "",
                formName: formData.FormName || "",
                description: formData.Description || "",
                machineId: formData.MachineID || "",
            });

            const subForms: any[] = [];
            const fields: any[] = [];

            formData?.SubForm?.forEach((item: any) => {
                const subForm = {
                    subFormId: item.SFormID || "",
                    subFormName: item.SFormName || "",
                    formId: item.FormID || "",
                    columns: item.Columns || "",
                    displayOrder: item.DisplayOrder || "",
                    machineId: formData.MachineID || "",
                };
                subForms.push(subForm);

                item.MatchCheckList?.forEach((itemOption: any) => {
                    const field = {
                        matchCheckListId: itemOption.MCListID || "",
                        checkListId: itemOption.CListID || "",
                        groupCheckListOptionId: itemOption.GCLOptionID || "",
                        checkListTypeId: itemOption.CTypeID || "",
                        dataTypeId: itemOption.DTypeID || "",
                        dataTypeValue: itemOption.DTypeValue || "",
                        subFormId: itemOption.SFormID || "",
                        require: itemOption.Required || false,
                        minLength: itemOption.MinLength || "",
                        maxLength: itemOption.MaxLength || "",
                        description: itemOption.Description || "",
                        placeholder: itemOption.Placeholder || "",
                        hint: itemOption.Hint || "",
                        displayOrder: itemOption.DisplayOrder || "",
                        expectedResult: expectedResultResponse?.[itemOption.MCListID] || "",
                    };
                    fields.push(field);
                });
            });

            dispatch(setSubForm({ subForms }));
            dispatch(
                setField({
                    formState: fields,
                    checkList,
                    checkListType,
                })
            );

        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
            fetchForm();
            return () => {
                dispatch(reset());
            };
        }, [fetchData, fetchForm])
    );

    const handleChange = (fieldName: string, value: string) => {
        setFormValues((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    const renderField = (field: Field) => {
        const fieldName = field.matchCheckListId;

        switch (field.CheckListTypeName) {
            case "Textinput":
                return (
                    <Inputs
                        placeholder={field.placeholder}
                        hint={field.hint}
                        label={field.CheckListName}
                        value={formValues[fieldName] || ""}
                        handleChange={(value) => handleChange(fieldName, value)}
                    />
                );
            case "Textarea":
                return (
                    <Textareas
                        placeholder={field.placeholder}
                        hint={field.hint}
                        label={field.CheckListName}
                        value={formValues[fieldName] || ""}
                        handleChange={(value) => handleChange(fieldName, value)}
                    />
                );
            case "Dropdown":
                const options = groupCheckListOption
                    ?.find((opt) => opt.GCLOptionID === field.groupCheckListOptionId)
                    ?.CheckListOptions.map((item) => ({
                        label: item.CLOptionName,
                        value: item.CLOptionID,
                    }));
                return (
                    <Selects
                        option={options}
                        hint={field.hint}
                        label={field.CheckListName}
                        value={formValues[fieldName] || ""}
                        handleChange={(value) => handleChange(fieldName, value)}
                    />
                );
            case "Radio":
                const radioOptions = groupCheckListOption
                    ?.find((opt) => opt.GCLOptionID === field.groupCheckListOptionId)
                    ?.CheckListOptions.map((item) => ({
                        label: item.CLOptionName,
                        value: item.CLOptionID,
                    }));
                return (
                    <Radios
                        option={radioOptions}
                        hint={field.hint}
                        label={field.CheckListName}
                        value={formValues[fieldName] || ""}
                        handleChange={(value) => handleChange(fieldName, value)}
                    />
                );
            case "Checkbox":
                const checkboxOptions = groupCheckListOption
                    ?.find((opt) => opt.GCLOptionID === field.groupCheckListOptionId)
                    ?.CheckListOptions.map((item) => ({
                        label: item.CLOptionName,
                        value: item.CLOptionID,
                    }));
                return (
                    <Checkboxs
                        option={checkboxOptions}
                        hint={field.hint}
                        label={field.CheckListName}
                        value={formValues[fieldName] || ""}
                        handleChange={(value) => handleChange(fieldName, value)}
                    />
                );
            default:
                return null;
        }
    };

    console.log(state);
    
    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
            }}
        >
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <AccessibleView>
                        <Text
                            style={[
                            ]}
                        >
                            {vform.formName}
                        </Text>
                        <Text
                            style={[
                            ]}
                        >
                            {vform.description}
                        </Text>
                    </AccessibleView>
                    {state.form.subForms.map((subForm: SubForm) => (
                        <View key={subForm.subFormName}>
                            <Divider />
                            <AccessibleView>
                                <Text>{subForm.subFormName}</Text>
                            </AccessibleView>
                            <View style={{ flexDirection: "row" }}>
                                {subForm.fields.map((field) => (
                                    <View
                                        key={field.matchCheckListId}
                                        style={{ flex: 1 / subForm.columns }}
                                    >
                                        {renderField(field)}
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </>
            )}
        </ScrollView>
    );
};

export default ViewFormScreen;
