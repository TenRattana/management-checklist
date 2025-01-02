import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import axiosInstance from "@/config/axios";
import { LoadingSpinner, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useToast } from '@/app/contexts/useToast';
import { useRes } from '@/app/contexts/useRes';
import { GroupCheckListOption } from '@/typing/type'
import { InitialValuesGroupCheckList } from '@/typing/value'
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { fetchGroupCheckListOption, fetchSearchGroupCheckListOption, saveGroupCheckListNoOption } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";

const LazyChecklist_group_dialog = lazy(() => import("@/components/screens/Checklist_group_dialog"));
const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

const ChecklistGroupScreen = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesGroupCheckList>({
        groupCheckListOptionId: "",
        groupCheckListOptionName: "",
        isActive: true,
        disables: false
    });

    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);

    const { data, isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['groupCheckListOption', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchGroupCheckListOption(debouncedSearchQuery)
                : fetchGroupCheckListOption(pageParam, 50);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 50 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat();
                setGroupCheckListOption(newItems);
            },
        }
    );

    const handlePaginationChange = useCallback(() => {
        if (hasNextPage && !isFetching) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetching, fetchNextPage]);

    useEffect(() => {
        if (debouncedSearchQuery === "") {
            setGroupCheckListOption([]);
            remove();
        } else {
            setGroupCheckListOption([]);
        }
    }, [debouncedSearchQuery, remove]);

    const mutation = useMutation(saveGroupCheckListNoOption, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false);
            queryClient.invalidateQueries('groupCheckListOption');
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

    const saveData = useCallback(async (values: InitialValuesGroupCheckList) => {
        const data = {
            Prefix: state.GroupCheckList ?? "",
            GCLOptionID: values.groupCheckListOptionId,
            GCLOptionName: values.groupCheckListOptionName,
            IsActive: values.isActive,
            Disables: values.disables,
        };

        mutation.mutate(data);
    }, [mutation]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post(
                    "GroupCheckListOption_service.asmx/GetGroupCheckListOption",
                    { GCLOptionID: item }
                );
                const groupCheckListOptionData = response.data.data[0] ?? {};
                setInitialValues({
                    groupCheckListOptionId: groupCheckListOptionData.GCLOptionID ?? "",
                    groupCheckListOptionName: groupCheckListOptionData.GCLOptionName ?? "",
                    isActive: Boolean(groupCheckListOptionData.IsActive),
                    disables: Boolean(groupCheckListOptionData.Disables)
                });
                setIsVisible(true);
                setIsEditing(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeGroupCheckListOption" : "DeleteGroupCheckListOption";
                const response = await axiosInstance.post(`GroupCheckListOption_service.asmx/${endpoint}`, { GCLOptionID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('groupCheckListOption');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return groupCheckListOption.map((item) => [
            item.Disables,
            item.GCLOptionName,
            item.IsActive,
            item.GCLOptionID,
        ]);
    }, [groupCheckListOption, debouncedSearchQuery]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            groupCheckListOptionId: "",
            groupCheckListOptionName: "",
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
            { label: "Group Option Name", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "center" },
        ],
        flexArr: [0, 6, 1, 1],
        actionIndex: [{ disables: 0, editIndex: 3, delIndex: 4 }],
        handleAction,
        showMessage: 1,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background
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
    });

    return (
        <View id="container-groupchecklist" style={styles.container}>
            <Card.Title
                title="Create Group Option"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Group CheckList..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-groupchecklist"
                />
                <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>Create Group Option</Text>
                </TouchableOpacity>
            </View>
            <Card.Content style={styles.cardcontent}>
                <Suspense fallback={<LoadingSpinner />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} />
                </Suspense>
                {isFetching && <LoadingSpinner />}
            </Card.Content>

            {isVisible && (
                <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                    <Suspense fallback={<LoadingSpinner />}>
                        <LazyChecklist_group_dialog
                            isVisible={isVisible}
                            setIsVisible={setIsVisible}
                            isEditing={isEditing}
                            initialValues={initialValues}
                            saveData={saveData}
                        />
                    </Suspense>
                </View>
            )}
        </View>
    );
});

export default ChecklistGroupScreen;
