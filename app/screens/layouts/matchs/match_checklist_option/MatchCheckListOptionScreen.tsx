import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import axiosInstance from "@/config/axios";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { Customtable, AccessibleView, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import Match_checklist_option from "@/components/screens/Match_checklist_option_dialog";
import { MatchCheckListOption } from '@/typing/type'
import { InitialValuesMatchCheckListOption } from '@/typing/value'
import { useMutation, useQueryClient, useInfiniteQuery } from 'react-query';
import { useSelector } from "react-redux";
import { fetchMatchCheckListOptions, fetchSearchMatchCheckListOptions, saveMatchCheckListOptions } from "@/app/services";

const MatchCheckListOptionScreen = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
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
    const [matchCheckListOption, setMatchCheckListOption] = useState<MatchCheckListOption[]>([])

    const handlePaginationChange = () => {
        hasNextPage && !isFetching && fetchNextPage()
    };

    const { data, isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['matchCheckListOption', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchMatchCheckListOptions(debouncedSearchQuery)
                : fetchMatchCheckListOptions(pageParam, 50);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 50 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat()
                setMatchCheckListOption(newItems);
            },
        }
    );

    useEffect(() => {
        if (debouncedSearchQuery === "") {
            setMatchCheckListOption([])
            remove()
        } else {
            setMatchCheckListOption([])
        }
    }, [debouncedSearchQuery, remove])

    const mutation = useMutation(saveMatchCheckListOptions, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false)
            queryClient.invalidateQueries('matchCheckListOption');
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
        const data = {
            Prefix: state.MatchCheckListOption ?? "",
            MCLOptionID: values.matchCheckListOptionId,
            GCLOptionID: values.groupCheckListOptionId,
            CLOptionID: JSON.stringify(values.checkListOptionId),
            IsActive: values.isActive,
            Disables: values.disables
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
                    groupCheckListOptionName: matchCheckListOption?.GCLOptionName,
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
                queryClient.invalidateQueries('matchCheckListOption');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return matchCheckListOption.map((item) => [
            item.Disables,
            item.GCLOptionName || "",
            item.CLOptionName || "",
            item.IsActive,
            item.MCLOptionID,
        ]);
    }, [matchCheckListOption, debouncedSearchQuery]);

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

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "", align: "flex-start" },
            { label: "Group Name", align: "flex-start" },
            { label: "Option Name", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [0, 3, 3, 1, 1],
        actionIndex: [
            {
                disables: 0,
                editIndex: 4,
                delIndex: 5,
            },
        ],
        showMessage: 1,
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    const styles = StyleSheet.create({
        container: {
            flex: 1
        },
        header: {
            fontSize: spacing.large,
            marginTop: spacing.small,
            paddingVertical: fontSize === "large" ? 7 : 5
        },
        functionname: {
            textAlign: 'center'
        },
        cardcontent: {
            padding: 2,
            flex: 1
        }
    })

    const MemoMatch_checklist_option = React.memo(Match_checklist_option)

    return (
        <AccessibleView name="container-matchchecklist" style={styles.container}>
            <Card.Title
                title="Create Match Group & Option"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Match Checklist Machine..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-match-checklist"
                />
                <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>Create Match Group & Option</Text>
                </TouchableOpacity>
            </AccessibleView>
            <Card.Content style={styles.cardcontent}>
                <Customtable {...customtableProps} handlePaginationChange={handlePaginationChange} />
            </Card.Content>

            <MemoMatch_checklist_option
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </AccessibleView>
    );
});

export default MatchCheckListOptionScreen;
