import { useMemo, useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useInfiniteQuery, useQuery, useQueryClient } from "react-query";
import { useToast } from "@/app/contexts/useToast";
import { AppDispatch } from "@/stores";
import { addField, updateField } from "@/slices";
import * as Yup from "yup";
import { fetchCheckList, fetchCheckListType, fetchDataType, fetchSearchCheckList, fetchSearchGroupCheckListOption, fetchGroupCheckListOption, fetchSearchCheckListOption, fetchCheckListOption } from "@/app/services";
import { Checklist, CheckList, GroupCheckListOption } from "@/typing/type";
import { BaseFormState } from "@/typing/form";

const useField = (editMode?: boolean, formState?: BaseFormState) => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();
    const { handleError } = useToast();
    const itemMLL = useSelector((state: any) => state.form);

    useEffect(() => {
        if (itemMLL.itemsMLL) {
            setItemsML((prevItems) => {
                const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                return [...prevItems, ...itemMLL.itemsMLL.filter((item: any) => !newItemsSet.has(item.value))];
            });
        }
    }, [itemMLL]);

    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<{ CheckList: string, MatchChecklist: string }>({ CheckList: '', MatchChecklist: '' });
    const [itemsCL, setItemsCL] = useState<({ label: string; value: string } & Checklist)[]>([]);
    const [itemsML, setItemsML] = useState<({ label: string; value: string } & GroupCheckListOption)[]>([]);

    const { data: checkList, isFetching: isFetchingCL, fetchNextPage: fetchNextPageCL, hasNextPage: hasNextPageCL, refetch: refetchCL } = useInfiniteQuery(
        ['checkList', debouncedSearchQuery.CheckList],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery.CheckList
                ? fetchSearchCheckList(debouncedSearchQuery.CheckList)
                : fetchCheckList(pageParam, 100);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 100 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().map((item) => ({
                    ...item,
                    label: item.CListName || 'Unknown',
                    value: item.CListID || '',
                }));

                setItemsCL((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            },
        }
    );

    const { data: groupCheckListOption, isFetching: isFetchingML, fetchNextPage: fetchNextPageML, hasNextPage: hasNextPageML, refetch: refetchML } = useInfiniteQuery(
        ['groupCheckListOption', debouncedSearchQuery.MatchChecklist],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery.MatchChecklist
                ? fetchSearchGroupCheckListOption(debouncedSearchQuery.MatchChecklist)
                : fetchGroupCheckListOption(pageParam, 100);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 100 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().map((item) => ({
                    ...item,
                    label: item.GCLOptionName || 'Unknown',
                    value: item.GCLOptionID || '',
                }));

                setItemsML((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            }
        }
    );

    const [itemsCLO, setItemsCLO] = useState<any[]>([]);
    const [debouncedSearchQueryCLO, setDebouncedSearchQueryCLO] = useState("");

    const { data: checkListOption, isFetching: isFetchingCLO, fetchNextPage: fetchNextPageCLO, hasNextPage: hasNextPageCLO, refetch: refetchCLO } = useInfiniteQuery(
        ['checkListOption', debouncedSearchQueryCLO],
        ({ pageParam = 0 }) => {
            return debouncedSearchQueryCLO
                ? fetchSearchCheckListOption(debouncedSearchQueryCLO)
                : fetchCheckListOption(pageParam, 100);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 100 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().map((item) => ({
                    ...item,
                    label: item.CLOptionName || 'Unknown',
                    value: item.CLOptionID || '',
                }));

                setItemsCLO((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            }

        }
    );

    useEffect(() => {
        if (editMode) {
            setDebouncedSearchQuery({ CheckList: formState?.CListName ?? "", MatchChecklist: formState?.GCLOptionName ?? "" })
        } else {
            queryClient.invalidateQueries("checkList")
            queryClient.invalidateQueries("groupCheckListOption")
        }
        queryClient.invalidateQueries("checkListOption")

    }, [editMode, formState]);


    const { data: checkListType = [] } = useQuery("checkListType", fetchCheckListType, {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: true,
        staleTime: 1000 * 60 * 24,
        cacheTime: 1000 * 60 * 25,
    });

    const { data: dataType = [] } = useQuery("dataType", fetchDataType, {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: true,
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
    }, [checkListTypes, dataType]);

    const handleSaveField = useCallback((values: any, mode: string) => {
        const payload = { BaseFormState: values, checkList: itemsCL, checkListType: checkListTypes, dataType };

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
        [dispatch, handleError, itemsCL, checkListTypes, dataType]
    );

    const handelSetDebouncedSearchQuery = useCallback((key: string, value: string) => {
        if (key === "CLO")
            setDebouncedSearchQueryCLO(value);
        else
            setDebouncedSearchQuery((prev) => ({ ...prev, [key]: value }));
    }, []);

    return useMemo(
        () => ({
            checkList: itemsCL.filter(v => v.IsActive),
            groupCheckListOption: itemsML.filter(v => v.IsActive),
            checkListOption: itemsCLO.filter(v => v.IsActive),
            checkListType,
            dataType,
            checkListTypes,
            validationSchema,
            handleSaveField,
            queryClient,
            isFetchingCL,
            hasNextPageCL,
            fetchNextPageCL,
            refetchCL,
            debouncedSearchQuery,
            handelSetDebouncedSearchQuery,
            isFetchingML,
            hasNextPageML,
            fetchNextPageML,
            refetchML,
            isFetchingCLO,
            hasNextPageCLO,
            fetchNextPageCLO,
            refetchCLO,
            debouncedSearchQueryCLO
        }),
        [
            itemsCL,
            checkListType,
            dataType,
            checkListTypes,
            validationSchema,
            handleSaveField,
            queryClient,
            isFetchingCL,
            hasNextPageCL,
            fetchNextPageCL,
            refetchCL,
            debouncedSearchQuery,
            handelSetDebouncedSearchQuery,
            itemsML,
            isFetchingML,
            hasNextPageML,
            fetchNextPageML,
            refetchML,
            itemsCLO,
            isFetchingCLO,
            hasNextPageCLO,
            fetchNextPageCLO,
            refetchCLO,
            debouncedSearchQueryCLO
        ]
    );
};

export default useField;
