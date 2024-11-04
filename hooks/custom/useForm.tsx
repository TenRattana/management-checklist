import { useState, useCallback, useMemo } from "react";
import axiosInstance from "@/config/axios";
import { setForm, setSubForm, setField, reset } from "@/slices";
import { useToast } from "@/app/contexts";
import { useFocusEffect } from "@react-navigation/native";
import * as Yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { SubForm, FormData, BaseFormState, BaseForm, BaseSubForm } from '@/typing/form';
import { CheckListType, CheckListOption, Checklist, DataType, GroupCheckListOption, Machine } from '@/typing/type';
import { useQuery, useQueryClient } from 'react-query';

const fetchData = async (serviceName: string, methodName: string) => {
    const response = await axiosInstance.post(`${serviceName}_service.asmx/${methodName}`);
    return response.data.data ?? [];
};

const useForm = (route: any) => {
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.form);
    const { formId, action, tableId, machineId } = route.params || {};

    const [found, setFound] = useState<boolean>(false);
    const [expectedResult, setExpectedResult] = useState<{ [key: string]: any }>({});
    const { handleError } = useToast();
    const queryClient = useQueryClient();

    const fetchAllData = useCallback(async () => {
        try {
            const data = await Promise.all([
                fetchData("CheckList", "GetCheckLists"),
                fetchData("CheckListOption", "GetCheckListOptions"),
                fetchData("GroupCheckListOption", "GetGroupCheckListOptions"),
                fetchData("GroupCheckListOption", "GetGroupCheckListOptionsActive"),
                fetchData("CheckListType", "GetCheckListTypes"),
                fetchData("DataType", "GetDataTypes"),
                fetchData("Machine", "GetMachines")
            ]);

            return {
                checkList: data[0],
                checkListOption: data[1],
                groupCheckListOption: data[2],
                groupCheckListOptionActive: data[3],
                checkListType: data[4],
                dataType: data[5],
                machine: data[6]
            };
        } catch (error) {
            handleError(error);
            return null;
        }
    }, [handleError]);

    const { data, isLoading } = useQuery('allData', fetchAllData, {
        refetchOnWindowFocus: false,
    });

    const { checkList, checkListOption, groupCheckListOption, groupCheckListOptionActive, checkListType, dataType, machine } = data || {};

    const fetchForm = useCallback(async (formId: string, isMachine: boolean = false) => {
        if (!formId) return null;
        try {
            const response = await axiosInstance.post(
                isMachine ? "Form_service.asmx/ScanForm" : "Form_service.asmx/GetForm",
                { FormID: formId }
            );
            setFound(response?.data?.status);
            return response?.data?.data?.[0] || null;
        } catch (error) {
            handleError(error);
            setFound(false);
            return null;
        }
    }, [handleError]);

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

    const loadForm = useCallback(async (formId: string, tableId?: string) => {
        if (tableId) {
            try {
                const response = await axiosInstance.post("ExpectedResult_service.asmx/GetExpectedResult", { TableID: tableId });
                setExpectedResult(response.data?.data[0] || []);
            } catch (error) {
                handleError(error);
            }
        }

        const formData = await fetchForm(formId);
        if (formData) {
            setFound(true);
            const { subForms, fields } = createSubFormsAndFields(formData, expectedResult);
            const foundMachine = machine.find((v: Machine) => v.MachineID === formData.MachineID);
            formData['MachineName'] = foundMachine ? foundMachine.MachineName : "";

            dispatch(setForm({ form: action === "copy" ? {} : formData }));
            dispatch(setSubForm({ subForms }));
            dispatch(setField({ BaseFormState: fields, checkList: checkList ?? [], checkListType: checkListType ?? [] }));
        } else {
            setFound(false);
        }
    }, [fetchForm, createSubFormsAndFields, expectedResult, dispatch, checkList, checkListType, machine, action]);

    const loadFormMachine = useCallback(async (machineId: string) => {
        const formData = await fetchForm(machineId, true);
        if (formData) {
            setFound(true);
            const { subForms, fields } = createSubFormsAndFields(formData);
            const foundMachine = machine.find((v: Machine) => v.MachineID === formData.MachineID);
            formData['MachineName'] = foundMachine ? foundMachine.MachineName : "";

            dispatch(setForm({ form: formData }));
            dispatch(setSubForm({ subForms }));
            dispatch(setField({ BaseFormState: fields, checkList: checkList ?? [], checkListType: checkListType ?? [] }));
        } else {
            setFound(false);
        }
    }, [fetchForm, createSubFormsAndFields, dispatch, checkList, checkListType, machine]);

    useFocusEffect(
        useCallback(() => {
            if (!isLoading && (formId || machineId)) {
                formId && !machineId && loadForm(formId, tableId);
                machineId && loadFormMachine(machineId);
            }
            return () => { dispatch(reset()) }
        }, [isLoading, formId, machineId, tableId, loadForm, loadFormMachine])
    );

    const validationSchema = useMemo(() => {
        if (isLoading) {
            const shape: any = {};

            state.subForms.forEach((subForm: BaseSubForm) => {
                subForm.Fields.forEach((field: BaseFormState) => {
                    const dataTypeName = dataType.find((item: DataType) => item.DTypeID === field.DTypeID)?.DTypeName;
                    const checkListTypeName = checkListType.find((item: CheckListType) => item.CTypeID === field.CTypeID)?.CTypeName;

                    let validator;

                    if (dataTypeName === "Number") {
                        validator = Yup.number()
                            .nullable()
                            .typeError(`The ${field.CListName} field must be a valid number`);

                        if (field.MinLength !== undefined && field.MinLength !== null) {
                            validator = validator.test(
                                'min-length',
                                `The ${field.CListName} minimum control value is ${field.MinLength}`,
                                value => value === undefined || value === null || Number(value) >= Number(field.MinLength)
                            );
                        }

                        if (field.MaxLength !== undefined && field.MaxLength !== null) {
                            validator = validator.test(
                                'max-length',
                                `The ${field.CListName} maximum control value is ${field.MaxLength}`,
                                value => value === undefined || value === null || Number(value) <= Number(field.MaxLength)
                            );
                        }

                        if (field.MinLength !== undefined && field.MinLength < 0) {
                            validator = validator.min(0, `The ${field.CListName} cannot be negative`);
                        }
                    } else if (dataTypeName === "String") {
                        if (checkListTypeName === "Checkbox") {
                            validator = Yup.array()
                                .of(Yup.string())
                                .min(1, `The ${field.CListName} field requires at least one option to be selected`);
                        } else {
                            validator = Yup.string()
                                .nullable()
                                .typeError(`The ${field.CListName} field must be a valid string`);
                        }
                    }

                    if (field.Required) {
                        validator = validator?.required(`The ${field.CListName} field is required`);
                    }

                    shape[field.MCListID] = validator;
                });
            });

            return Yup.object().shape(shape);
        }
    }, [state.subForms, isLoading, dataType, checkListType]);

    return {
        found,
        state,
        checkListOption,
        dataType,
        checkList,
        checkListType,
        groupCheckListOption: tableId || machineId ? groupCheckListOption : groupCheckListOptionActive,
        machine,
        isLoading,
        dispatch,
        validationSchema
    };
};

export default useForm;
