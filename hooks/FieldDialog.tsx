import { useMemo, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useToast } from "@/app/contexts/useToast";
import { AppDispatch } from "@/stores";
import { addField, updateField } from "@/slices";
import * as Yup from "yup";
import { fetchCheckList, fetchCheckListType, fetchDataType, fetchGroupCheckList, saveCheckList, saveGroupCheckListOption, saveCheckListOption } from "@/app/services";
import { InitialValuesChecklist, InitialValuesGroupCheckList } from "@/typing/value";
import { CheckList } from "@/typing/type";

const useField = () => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();
    const { handleError, showSuccess } = useToast();
    const state = useSelector((state: any) => state.prefix);

    const { data: checkList = [] } = useQuery("checkList", () => fetchCheckList(0, 10000), {
        staleTime: 1000 * 60 * 24,
        cacheTime: 1000 * 60 * 25,
    });

    const { data: groupCheckListOption = [] } = useQuery("groupCheckListOption", () => fetchGroupCheckList(0, 10000), {
        staleTime: 1000 * 60 * 24,
        cacheTime: 1000 * 60 * 25,
    });

    const { data: checkListType = [] } = useQuery("checkListType", fetchCheckListType, {
        staleTime: 1000 * 60 * 24,
        cacheTime: 1000 * 60 * 25,
    });

    const { data: dataType = [] } = useQuery("dataType", fetchDataType, {
        staleTime: 1000 * 60 * 24,
        cacheTime: 1000 * 60 * 25,
    });

    const checkListTypes = useMemo(
        () =>
            checkListType
                .filter(group => group.CheckList)
                .flatMap(group => group.CheckList)
                .filter((checkList): checkList is CheckList => checkList !== undefined),
        [checkListType]
    );

    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            CListID: Yup.string().required("The checklist field is required."),
            CTypeID: Yup.string().required("The checklist type field is required."),
            Required: Yup.boolean().required("The required field is required."),
            Important: Yup.boolean().required("The important field is required."),
            DTypeID: Yup.lazy((value, context) => {
                const CTypeID = checkListTypes?.find(v => v.CTypeID === context.parent.CTypeID)?.CTypeName;
                if (CTypeID && ['Textinput'].includes(CTypeID)) {
                    return Yup.string().required("Data Type is required for Text.");
                }
                return Yup.string().nullable();
            }),
            DTypeValue: Yup.lazy((value, context) => {
                const DTypeID = dataType?.find(v => v.DTypeID === context.context.DTypeID)?.DTypeName;
                if (DTypeID === "Number") {
                    return Yup.number().typeError("The digit value must be a number.").nullable();
                }
                return Yup.string().nullable();
            }),
            Rowcolumn: Yup.number().typeError("The row column must be a number.").nullable(),
            GCLOptionID: Yup.lazy((value, context) => {
                const CTypeID = checkListTypes?.find((v) => v.CTypeID === context.context.CTypeID)?.CTypeName;
                if (CTypeID && ['Dropdown', 'Checkbox', 'Radio'].includes(CTypeID)) {
                    return Yup.string().required("GCLOptionID is required for Dropdown/Select/Radio.");
                }
                return Yup.string().nullable();
            }),
            ImportantList: Yup.array().of(
                Yup.object().shape({
                    Value: Yup.lazy((value, context) => {
                        const isImportant = context.context?.Important || false;
                        const hasGCLOptionID = context.context?.GCLOptionID;

                        if (isImportant && hasGCLOptionID) {
                            if (Array.isArray(value)) {
                                return Yup.array()
                                    .of(Yup.string().required("Each selected option is required."))
                                    .min(1, "You must select at least one option.")
                                    .required("Important value is required when marked as important.");
                            } else {
                                return Yup.string()
                                    .required("Important value is required when marked as important.")
                                    .nullable();
                            }
                        }
                        return Yup.mixed().nullable();
                    }),
                    MinLength: Yup.lazy((value, context) => {
                        const DTypeID = dataType?.find(v => v.DTypeID === context.context?.DTypeID)?.DTypeName;
                        const max = context.parent.MaxLength;
                        const isImportant = context.context?.Important;

                        if (DTypeID === "Number" && isImportant) {
                            if (!max && !value) {
                                return Yup.number()
                                    .typeError("The min value control must be a number.")
                                    .required("The min value control is required.");
                            } else if (max) {
                                return Yup.number()
                                    .typeError("The max value control must be a number.")
                                    .max(max, 'Min length must be less than or equal to Max length');
                            }
                        }

                        return Yup.number()
                            .typeError("The min value control must be a number.")
                            .nullable();
                    }),
                    MaxLength: Yup.lazy((value, context) => {
                        const DTypeID = dataType?.find(v => v.DTypeID === context.context?.DTypeID)?.DTypeName;
                        const min = context.parent.MinLength;
                        const isImportant = context.context?.Important;

                        if (DTypeID === "Number" && isImportant) {
                            if (!min && !value) {
                                return Yup.number()
                                    .typeError("The max value control must be a number.")
                                    .min(min + 1, 'Max length must be greater than or equal to Min length')
                                    .required("The max value control is required.");
                            } else if (min) {
                                return Yup.number()
                                    .typeError("The max value control must be a number.")
                                    .min(min, 'Max length must be greater than or equal to Min length');
                            }
                        }

                        return Yup.number()
                            .typeError("The max value control must be a number.")
                            .nullable();
                    }),
                })
            )
        });
    }, [checkListType, dataType]);

    const mutation = useMutation(saveCheckList, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries("checkList");
        },
        onError: handleError,
    });

    const mutationG = useMutation(saveGroupCheckListOption, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries("groupCheckListOption");
        },
        onError: handleError,
    });

    const mutationCL = useMutation(saveCheckListOption, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries("checkListOption");
        },
        onError: handleError,
    });

    const saveDataCheckList = useCallback((values: InitialValuesChecklist) => {
        mutation.mutate({
            Prefix: state.CheckList ?? "",
            CListID: "",
            CListName: values.checkListName,
            IsActive: values.isActive,
            Disables: values.disables,
        });
    },
        [mutation, state.CheckList]
    );

    const saveDataGroupCheckList = useCallback((values: InitialValuesGroupCheckList, options: string[]) => {
        mutationG.mutate({
            Prefix: state.GroupCheckList ?? "",
            PrefixMatch: state.MatchCheckListOption ?? "",
            GCLOptionID: values.groupCheckListOptionId,
            GCLOptionName: values.groupCheckListOptionName,
            IsActive: values.isActive,
            Disables: values.disables,
            Options: JSON.stringify(options),
        });
    },
        [mutationG, state.GroupCheckList, state.MatchCheckListOption]
    );

    const handleSaveField = useCallback((values: any, mode: string) => {
        const payload = { BaseFormState: values, checkList, checkListType: checkListTypes, dataType };

        try {
            if (mode === "add") {
                dispatch(addField(payload));
            } else if (mode === "update") {
                dispatch(updateField(payload));
            }
        } catch (error) {
            handleError(error);
        }
    },
        [dispatch, handleError, checkList, checkListTypes, dataType]
    );

    return useMemo(
        () => ({
            saveDataCheckList,
            saveDataGroupCheckList,
            checkList: checkList.filter(v => v.IsActive),
            groupCheckListOption: groupCheckListOption.filter(v => v.IsActive),
            checkListType,
            dataType,
            checkListTypes,
            validationSchema,
            handleSaveField,
            queryClient
        }),
        [
            saveDataCheckList,
            saveDataGroupCheckList,
            checkList,
            groupCheckListOption,
            checkListType,
            dataType,
            checkListTypes,
            validationSchema,
            handleSaveField,
            queryClient
        ]
    );
};

export default useField;
