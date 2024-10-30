import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast, useRes } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar, Text } from "@/components";
import { Card, Divider, useTheme } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import Match_checklist_option from "@/components/screens/Match_checklist_option_dialog";
import { CheckListOption, MatchCheckListOption, GroupCheckListOption, } from '@/typing/type'
import { InitialValuesMatchCheckListOption } from '@/typing/value'
import { useFocusEffect } from "expo-router";
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from "react-redux";

const fetchCheckListOptions = async (): Promise<CheckListOption[]> => {
    const response = await axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions");
    return response.data.data ?? [];
};

const fetchGroupCheckListOptions = async (): Promise<GroupCheckListOption[]> => {
    const response = await axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions");
    return response.data.data ?? [];
};
const fetchMatchCheckListOptions = async (): Promise<MatchCheckListOption[]> => {
    const response = await axiosInstance.post("MatchCheckListOption_service.asmx/GetMatchCheckListOptions");
    return response.data.data ?? [];
};

const saveMatchCheckListOptions = async (data: MatchCheckListOption): Promise<{ message: string }> => {
    const response = await axiosInstance.post("MatchCheckListOption_service.asmx/SaveMatchCheckListOption", data);
    return response.data;
};


const MatchCheckListOptionScreen = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesMatchCheckListOption>({
        matchCheckListOptionId: "",
        checkListOptionId: [],
        groupCheckListOptionId: "",
        isActive: true,
        disables: false
    });

    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();

    const { data: checkListOption = [] } = useQuery<CheckListOption[], Error>(
        'checkListOption',
        fetchCheckListOptions,
        {
            refetchOnWindowFocus: false,
        });

    const { data: groupCheckListOption = [] } = useQuery<GroupCheckListOption[], Error>(
        'groupCheckListOption',
        fetchGroupCheckListOptions,
        {
            refetchOnWindowFocus: false,
        });

    const { data: matchCheckListOption = [], isLoading } = useQuery<MatchCheckListOption[], Error>(
        'matchCheckListOption',
        fetchMatchCheckListOptions,
        {
            refetchOnWindowFocus: false,
        });

    const mutation = useMutation(saveMatchCheckListOptions, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false)
            queryClient.invalidateQueries('machines');
            queryClient.getQueryCache()
        },
        onError: handleError,
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const saveData = useCallback(async (values: InitialValuesMatchCheckListOption) => {
        setIsLoadingButton(true);

        const data = {
            Prefix: state.MatchCheckListOption ?? "",
            MCLOptionID: values.matchCheckListOptionId,
            GCLOptionID: values.groupCheckListOptionId,
            CLOptionID: JSON.stringify(values.checkListOptionId),
            IsActive: values.isActive,
        };

        mutation.mutate(data);
    }, [mutation]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
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
                    disables: Boolean(matchCheckListOption.Disables),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeMatchCheckListOption" : "DeleteMatchCheckListOption";
                const response = await axiosInstance.post(`MatchCheckListOption_service.asmx/${endpoint}`, { MCLOptionID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('machines');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return matchCheckListOption.flatMap((item) =>
            item.CheckListOptions.map(option => {
                const matchedOption = checkListOption.find(group => group.CLOptionID === option.CLOptionID);
                return [
                    item.GCLOptionName,
                    matchedOption?.CLOptionName || "",
                    item.IsActive,
                    item.MCLOptionID,
                ];
            })
        );
    }, [matchCheckListOption, checkListOption, debouncedSearchQuery]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            matchCheckListOptionId: "",
            checkListOptionId: [],
            groupCheckListOptionId: "",
            isActive: true,
            disables: false
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

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Group Name", align: "flex-start" },
            { label: "Option Name", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [3, 3, 1, 1],
        actionIndex: [
            {
                editIndex: 3,
                delIndex: 4,
            },
        ],
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    return (
        <AccessibleView name="container-matchchecklist" style={{ flex: 1 }}>
            <Card.Title
                title="Create Match Group & Option"
                titleStyle={[masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Match Checklist Machine..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-match-checklist"
                />
                <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Create Match Group & Option</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={{ padding: 2, flex: 1 }}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>

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

        </AccessibleView>
    );
};

export default React.memo(MatchCheckListOptionScreen);
