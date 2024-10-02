import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from 'axios'
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, Searchbar } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Checklist_option_dialog from "@/components/screens/Checklist_option_dialog";
interface checkListOption {
    CLOptionName: string
    IsActive: boolean;
    CLOptionID: string;
}
interface InitialValues {
    checkListOptionId: string;
    checkListOptionName: string;
    isActive: boolean;
}

const CheckListOptionScreen = () => {
    const [checkListOption, setCheckListOption] = useState<checkListOption[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValues>({
        checkListOptionId: "",
        checkListOptionName: "",
        isActive: true,
    });

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, showError } = useToast();
    const { colors } = useTheme();
    const { spacing } = useRes();

    const errorMessage = useCallback((error: unknown) => {
        let errorMessage: string | string[];

        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.errors ?? ["Something went wrong!"];
        } else if (error instanceof Error) {
            errorMessage = [error.message];
        } else {
            errorMessage = ["An unknown error occurred!"];
        }

        showError(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
    }, [showError]);

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions");
            setCheckListOption(response.data.data ?? []);
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveData = async (values: InitialValues) => {
        setIsLoadingButton(true);

        const data = {
            CLOptionID: values.checkListOptionId,
            CLOptionName: values.checkListOptionName,
            isActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post(
                "CheckListOption_service.asmx/SaveCheckListOption",
                data
            );
            setIsVisible(!response.data.status);
            showSuccess(String(response.data.message))

            await fetchData();
        } catch (error) {
            errorMessage(error)
        } finally {
            setIsLoadingButton(false);
        }
    };

    const handleAction = async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axios.post(
                    "CheckListOption_service.asmx/GetCheckListOption",
                    {
                        CLOptionID: item,
                    }
                );
                const checkListOptionData = response.data.data[0] ?? {};
                setInitialValues({
                    checkListOptionId: checkListOptionData.CLOptionID ?? "",
                    checkListOptionName: checkListOptionData.CLOptionName ?? "",
                    isActive: Boolean(checkListOptionData.IsActive),
                });
                setIsVisible(true);
                setIsEditing(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeCheckListOption" : "DeleteCheckListOption";
                const response = await axiosInstance.post(`CheckListOption_service.asmx/${endpoint}`, { CLOptionID: item });
                showSuccess(String(response.data.message));

                await fetchData()
            }
        } catch (error) {
            errorMessage(error)
        }
    };

    const tableData = useMemo(() => {
        return checkListOption.map(item => [
            item.CLOptionName,
            item.IsActive,
            item.CLOptionID,
            item.CLOptionID
        ]);
    }, [checkListOption]);

    const tableHead = [
        { label: "Check List Option Name", align: "flex-start" },
        { label: "Change Status", align: "center" },
        { label: "Edit", align: "center" },
        { label: "Delete", align: "center" },
    ];

    const actionIndex = [{ editIndex: 2, delIndex: 3 }];

    const handelNewData = useCallback(() => {
        setInitialValues({
            checkListOptionId: "",
            checkListOptionName: "",
            isActive: true,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = {
        Tabledata: tableData,
        Tablehead: tableHead,
        flexArr: [3, 1, 1, 1],
        actionIndex,
        handleAction,
        searchQuery,
    };

    return (
        <ScrollView>
            <Card>
                <Card.Title
                    titleStyle={[
                        masterdataStyles.text,
                        masterdataStyles.textBold,
                        { fontSize: spacing.large, textAlign: "center", marginTop: 30, paddingTop: 10, marginBottom: 30 }
                    ]}
                    title="Create Option"
                />
                <Card.Content>
                    <Searchbar
                        viewProps={
                            <Pressable
                                onPress={handelNewData}
                                style={[masterdataStyles.button, masterdataStyles.backMain, { marginHorizontal: 0 }]}
                            >
                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Create Check List</Text>
                            </Pressable>
                        }
                        searchQuery={searchQuery}
                        handleChange={setSearchQuery}
                    />
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <Customtable {...customtableProps} />
                    )}
                </Card.Content>
            </Card>

            <Checklist_option_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </ScrollView>
    );
};

export default React.memo(CheckListOptionScreen);
