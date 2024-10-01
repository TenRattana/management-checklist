import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from 'axios'
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, Searchbar } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Checklist_dialog from "@/components/screens/Checklist_dialog";

interface InitialValues {
    checkListId: string;
    checkListName: string;
    isActive: boolean;
}

interface Checklist {
    CListID: string;
    CListName: string;
    IsActive: boolean;
}

const CheckListScreen = () => {
    const [checkList, setCheckList] = useState<Checklist[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValues>({
        checkListId: "",
        checkListName: "",
        isActive: true,
    });

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, showError } = useToast();
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
            const response = await axiosInstance.post("CheckList_service.asmx/GetCheckLists");
            setCheckList(response.data.data ?? []);
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
            CListId: values.checkListId ?? "",
            CListName: values.checkListName,
            isActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post("CheckList_service.asmx/SaveCheckList", data);
            setIsVisible(!response.data.status);
            showSuccess(String(response.data.message));

            await fetchData();
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoadingButton(false);
        }
    };

    const handleAction = async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post("CheckList_service.asmx/GetCheckList", { CListID: item });
                const checkListData = response.data.data[0] ?? {};
                setInitialValues({
                    checkListId: checkListData.CListID ?? "",
                    checkListName: checkListData.CListName ?? "",
                    isActive: Boolean(checkListData.IsActive),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeCheckList" : "DeleteCheckList";
                const response = await axiosInstance.post(`CheckList_service.asmx/${endpoint}`, { CListID: item });
                showSuccess(String(response.data.message));

                await fetchData();
            }
        } catch (error) {
            errorMessage(error);
        }
    };

    const tableData = useMemo(() => {
        return checkList.map(item => [
            item.CListName,
            item.IsActive,
            item.CListID,
            item.CListID,
        ]);
    }, [checkList]);

    const tableHead = [
        { label: "Check List Name", align: "flex-start" },
        { label: "Change Status", align: "center" },
        { label: "Edit", align: "center" },
        { label: "Delete", align: "center" },
    ];

    const actionIndex = [{ editIndex: 2, delIndex: 3 }];

    const handelNewData = useCallback(() => {
        setInitialValues({
            checkListId: "",
            checkListName: "",
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
                    title="List of Check Lists"
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

            <Checklist_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </ScrollView>
    );
};

export default React.memo(CheckListScreen);
