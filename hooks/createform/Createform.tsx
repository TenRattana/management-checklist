import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../config/axios"; "@/config/axios";
import axios from "axios";
import { setSubForm, setField, reset } from "@/slices";
import { useToast, useTheme, useRes } from "@/app/contexts";
import { useFocusEffect } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import useMasterdataStyles from "@/styles/common/masterdata";

interface Form {
    formId: string;
    formName: string;
    description: string;
    machineId: string;
}

interface SubForm {
    subFormId: string;
    subFormName: string;
    formId: string;
    columns: string;
    displayOrder: string;
    machineId: string;
}

interface FormState {
    matchCheckListId: string;
    checkListId: string;
    groupCheckListOptionId: string;
    checkListTypeId: string;
    dataTypeId: string;
    dataTypeValue: string;
    subFormId: string;
    require: boolean;
    minLength: string;
    maxLength: string;
    description: string;
    placeholder: string;
    hint: string;
    displayOrder: string;
}

interface CheckListType {
    CTypeName: string;
    icon?: string;
}

interface DataType {
    DTypeName: string;
    icon?: string;
}

interface UseFormBuilderProps {
    route: RouteProp<{ params: { formId: string; action: string } }, 'params'>;
}

export const useFormBuilder = ({ route }: UseFormBuilderProps) => {
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.form);

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [showDialogs, setShowDialogs] = useState({
        subForm: false,
        field: false,
        save: false,
    });

    const [form, setForm] = useState<Form>({
        formId: "",
        formName: "",
        description: "",
        machineId: "",
    });

    const [subForm, setSubInForm] = useState<SubForm>({
        subFormId: "",
        subFormName: "",
        formId: "",
        columns: "",
        displayOrder: "",
        machineId: "",
    });

    const [formState, setFormState] = useState<FormState>({
        matchCheckListId: "",
        checkListId: "",
        groupCheckListOptionId: "",
        checkListTypeId: "",
        dataTypeId: "",
        dataTypeValue: "",
        subFormId: "",
        require: false,
        minLength: "",
        maxLength: "",
        description: "",
        placeholder: "",
        hint: "",
        displayOrder: "",
    });

    const [checkList, setCheckList] = useState<any[]>([]);
    const [groupCheckListOption, setGroupCheckListOption] = useState<any[]>([]);
    const [checkListType, setCheckListType] = useState<CheckListType[]>([]);
    const [dataType, setDataType] = useState<DataType[]>([]);
    const { formId, action } = route.params || {};

    const [isLoading, setIsLoading] = useState(false);
    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, showError } = useToast();
    const { colors } = useTheme();
    const { spacing } = useRes();

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
                axios.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions"),
                axios.post("CheckListType_service.asmx/GetCheckListTypes"),
                axios.post("DataType_service.asmx/GetDataTypes"),
            ]);

            setCheckList(checkListResponse.data.data ?? []);
            setGroupCheckListOption(groupCheckListOptionResponse.data.data ?? []);
            setCheckListType(
                checkListTypeResponse.data?.data.map((v: any) => {
                    switch (v.CTypeName) {
                        case "Textinput":
                            return { ...v, icon: "format-text" };
                        case "Textarea":
                            return { ...v, icon: "text-long" };
                        case "Radio":
                            return { ...v, icon: "order-bool-ascending" };
                        case "Checkbox":
                            return { ...v, icon: "order-bool-ascending-variant" };
                        case "Dropdown":
                            return { ...v, icon: "format-list-group" };
                        case "Text":
                            return { ...v, icon: "format-color-text" };
                        default:
                            return v;
                    }
                }) ?? []
            );

            setDataType(
                dataTypeResponse.data?.data.map((v: any) =>
                    v.DTypeName === "String"
                        ? { ...v, icon: "format-color-text" }
                        : { ...v, icon: "numeric" }
                ) ?? []
            );
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData()
            return () => { };
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            if (isDataLoaded && formId) {
                const fetchFormData = async () => {
                    let route = "";
                    let data = {};

                    if (formId) {
                        data = { FormID: formId };
                        route = "Form_service.asmx/GetForm";
                    }
                    try {
                        const formResponse = await axios.post(route, data);
                        const formData = formResponse.data.data[0] ?? [];

                        if (action !== "copy") {
                            setForm({
                                formId: formData.FormID,
                                formName: formData.FormName,
                                description: formData.Description,
                                machineId: formData.MachineID || "",
                            });
                        } else {
                            setForm({
                                formId: "",
                                formName: "",
                                description: "",
                                machineId: "",
                            });
                        }

                        const subForms: SubForm[] = [];
                        const fields: FormState[] = [];

                        if (formData?.SubForm) {
                            formData.SubForm.forEach((item: any) => {
                                const subForm = {
                                    subFormId: item.SFormID || "",
                                    subFormName: item.SFormName || "",
                                    formId: item.FormID || "",
                                    columns: item.Columns || "",
                                    displayOrder: item.DisplayOrder || "",
                                    machineId: formData.MachineID || "",
                                };
                                if (item.MatchCheckList) {
                                    item.MatchCheckList.forEach((itemOption: any) => {
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
                                            expectedResult: itemOption.EResult || "",
                                        };
                                        fields.push(field);
                                    });
                                }
                                subForms.push(subForm);
                            });
                        }

                        dispatch(setSubForm({ subForms }));
                        dispatch(
                            setField({
                                formState: fields,
                                checkList,
                                checkListType,
                                groupCheckListOption,
                                dataType,
                            })
                        );
                    } catch (error: any) {
                        errorMessage(error);
                    } finally {
                        setIsLoading(false);
                    }
                };

                fetchFormData();
            }
            return () => {
                dispatch(reset());
            };
        }, [formId, isDataLoaded, action])
    );

    return {
        form,
        state,
        subForm,
        formState,
        showDialogs,
        checkList,
        checkListType,
        groupCheckListOption,
        dataType,
        setForm,
        showError,
        showSuccess,
        dispatch,
        setSubInForm,
        setFormState,
        setShowDialogs,
        isLoading,
    };
};
