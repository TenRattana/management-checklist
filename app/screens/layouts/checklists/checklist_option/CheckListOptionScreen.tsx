import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from 'axios'
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView } from "@/components";
import { Card, Divider, Searchbar } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Checklist_option_dialog from "@/components/screens/Checklist_option_dialog";
import { CheckListOption } from '@/typing/type'
import { InitialValuesCheckListOption } from '@/typing/value'
import { useFocusEffect } from "expo-router";

const CheckListOptionScreen = () => {
    const [checkListOption, setCheckListOption] = useState<CheckListOption[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesCheckListOption>({
        checkListOptionId: "",
        checkListOptionName: "",
        isActive: true,
    });
    console.log("CheckListOptionScreen");

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { colors } = useTheme();
    const { spacing } = useRes();

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions");
            setCheckListOption(response.data.data ?? []);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
            return () => { };
        }, [])
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const saveData = async (values: InitialValuesCheckListOption) => {
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
            handleError(error)
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
            handleError(error)
        }
    };

    const tableData = useMemo(() => {
        return checkListOption.map(item => [
            item.CLOptionName,
            item.IsActive,
            item.CLOptionID,
        ]);
    }, [checkListOption, debouncedSearchQuery]);

    const tableHead = [
        { label: "Check List Option Name", align: "flex-start" },
        { label: "Change Status", align: "center" },
        { label: "", align: "flex-end" },
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
        flexArr: [6, 1, 1],
        actionIndex,
        handleAction,
        searchQuery: debouncedSearchQuery,
    };

    const handleChange = (text: string) => {
        setSearchQuery(text);
    };

    return (
        <ScrollView style={{ paddingHorizontal: 15 }}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold,
            { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>Create Option
            </Text>
            <Divider style={{ marginBottom: 20 }} />
            <Card style={{ borderRadius: 5 }}>
                <AccessibleView style={{ paddingVertical: 20, flexDirection: 'row' }}>
                    <Searchbar
                        placeholder="Search Machine..."
                        value={searchQuery}
                        onChangeText={handleChange}
                        style={masterdataStyles.searchbar}
                        iconColor="#007AFF"
                        placeholderTextColor="#a0a0a0"
                    />
                    <Pressable onPress={handelNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textBold, masterdataStyles.textLight]}>Create Option</Text>
                    </Pressable>
                </AccessibleView>
                <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
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
