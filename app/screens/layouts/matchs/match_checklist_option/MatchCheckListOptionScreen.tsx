import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from 'axios'
import axiosInstance from "@/config/axios";
import { useToast, useTheme, useRes } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import Match_checklist_option from "@/components/screens/Match_checklist_option_dialog";
import { CheckListOption, MatchCheckListOption, GroupCheckListOption, } from '@/typing/type'
import { InitialValuesMatchCheckListOption } from '@/typing/value'


const MatchCheckListOptionScreen = () => {
    const [checkListOption, setCheckListOption] = useState<CheckListOption[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);
    const [matchCheckListOption, setMatchCheckListOption] = useState<MatchCheckListOption[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesMatchCheckListOption>({
        matchCheckListOptionId: "",
        checkListOptionId: [],
        groupCheckListOptionId: "",
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
            const [
                checkListOptionResponse,
                groupCheckListOptionResponse,
                matchCheckListOptionResponse,
            ] = await Promise.all([
                axios.post("CheckListOption_service.asmx/GetCheckListOptions"),
                axios.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions"),
                axios.post("MatchCheckListOption_service.asmx/GetMatchCheckListOptions"),
            ]);

            setCheckListOption(checkListOptionResponse.data.data ?? []);
            setGroupCheckListOption(groupCheckListOptionResponse.data.data ?? []);
            setMatchCheckListOption(matchCheckListOptionResponse.data.data ?? []);
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveData = async (values: InitialValuesMatchCheckListOption) => {
        setIsLoadingButton(true);

        const data = {
            MCLOptionID: values.matchCheckListOptionId,
            GCLOptionID: values.groupCheckListOptionId,
            CLOptionID: JSON.stringify(values.checkListOptionId),
            isActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post("MatchCheckListOption_service.asmx/SaveMatchCheckListOption", data);
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

                const response = await axiosInstance.post("MatchCheckListOption_service.asmx/GetMatchCheckListOption", { MCLOptionID: item });
                const matchCheckListOption = response.data.data[0] ?? {};
                const option = matchCheckListOption.CheckListOptions?.map((v: { CLOptionID: string }) => v.CLOptionID) || [];

                setInitialValues({
                    matchCheckListOptionId: matchCheckListOption.MCLOptionID ?? "",
                    groupCheckListOptionId: matchCheckListOption.GCLOptionID ?? "",
                    checkListOptionId: option,
                    isActive: Boolean(matchCheckListOption.IsActive),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeMatchCheckListOption" : "DeleteMatchCheckListOption";
                const response = await axiosInstance.post(`MatchCheckListOption_service.asmx/${endpoint}`, { MCLOptionID: item });
                showSuccess(String(response.data.message));

                await fetchData();
            }
        } catch (error) {
            errorMessage(error);
        }
    };

    const tableData = useMemo(() => {
        return matchCheckListOption.flatMap((item) =>
            item.CheckListOptions.map((option) => {
                const matchedOption = checkListOption.find((group) => group.CLOptionID === option.CLOptionID);
                return [
                    item.GCLOptionName,
                    matchedOption?.CLOptionName || "",
                    item.IsActive,
                    item.MCLOptionID,
                ];
            })
        );
    }, [matchCheckListOption, checkListOption]);

    const tableHead = [
        { label: "Group Name", align: "flex-start" },
        { label: "Option Name", align: "flex-start" },
        { label: "Status", align: "center" },
        { label: "", align: "flex-end" },
    ];

    const actionIndex = [
        {
            editIndex: 3,
            delIndex: 4,
        },
    ];

    const handleNewData = useCallback(() => {
        setInitialValues({
            matchCheckListOptionId: "",
            checkListOptionId: [],
            groupCheckListOptionId: "",
            isActive: true,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const dropcheckListOption = useMemo(() => {
        return Array.isArray(checkListOption)
            ? checkListOption.filter(
                (v) => v.IsActive || v.CLOptionID === initialValues.checkListOptionId[0]
            )
            : [];
    }, [checkListOption, initialValues.checkListOptionId]);

    const dropgroupCheckListOption = useMemo(() => {
        return Array.isArray(groupCheckListOption)
            ? groupCheckListOption.filter(
                (v) => v.IsActive || v.GCLOptionID === initialValues.groupCheckListOptionId
            )
            : [];
    }, [groupCheckListOption, initialValues.groupCheckListOptionId]);

    const customtableProps = {
        Tabledata: tableData,
        Tablehead: tableHead,
        flexArr: [3, 3, 1, 1],
        actionIndex,
        handleAction,
        searchQuery,
    };

    const handleChange = (text: string) => {
        setSearchQuery(text);
    };

    return (
        <ScrollView style={{ paddingHorizontal: 15 }}>
        <Text style={[masterdataStyles.text, masterdataStyles.textBold,
        { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>Create Match Group & Option
        </Text>
        <Divider style={{ marginBottom: 20 }} />
        <Card style={{ borderRadius: 5 }}>
            <AccessibleView style={{ paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textBold, masterdataStyles.textLight]}>Create Match Group & Option</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>
        </Card>

            <Match_checklist_option
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
                dropcheckListOption={dropcheckListOption}
                checkListOption={checkListOption}
                groupCheckListOption={groupCheckListOption}
                dropgroupCheckListOption={dropgroupCheckListOption}
            />

        </ScrollView>
    );
};

export default React.memo(MatchCheckListOptionScreen);
