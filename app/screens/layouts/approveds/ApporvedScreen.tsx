import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from '@/app/contexts/useToast';
import { useRes } from '@/app/contexts/useRes';
import { Customtable, LoadingSpinner, AccessibleView } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { ExpectedResult } from "@/typing/type";
import { ExpectedResultProps } from "@/typing/tag";
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { fetchApporved, fetchSearchApporved, SaveApporved } from "@/app/services";

const ApprovedScreen: React.FC<ExpectedResultProps> = React.memo(({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();
    const user = useSelector((state: any) => state.user)

    const [paginationInfo, setPaginationInfo] = useState({
        currentPage: 0,
        pageSize: 100,
    });

    const handlePaginationChange = (currentPage: number, pageSize: number) => {
        setPaginationInfo({ currentPage, pageSize });
    };

    const { data: approved = [], isLoading } = useQuery<ExpectedResult[], Error>(
        ['approved', paginationInfo, debouncedSearchQuery],
        () => debouncedSearchQuery ? fetchSearchApporved(debouncedSearchQuery) : fetchApporved(paginationInfo.currentPage, paginationInfo.pageSize),
        {
            keepPreviousData: true,
        }
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        const data = approved.find((v) => v.TableID === item);

        try {
            if (action === "preIndex") {
                if (data) {
                    navigation.navigate("Preview", {
                        formId: data.FormID,
                        tableId: data.TableID,
                    });
                }
            } else if (action === "Apporved") {
                const UserData = {
                    UserID: user.UserID,
                    UserName: user.Full_Name,
                    GUserID: user.GUserID,
                }

                mutation.mutate({ TableID: selectedRows, UserData });
                setSelectedRows([])
            } else if (action === "ResetRow") {
                setSelectedRows([])
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, approved, selectedRows, user]);

    const convertToThaiDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear() + 543;
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} เวลา ${hours}:${minutes}`;
    };

    const setRow = useCallback((value: string[]) => {
        setSelectedRows(value)
    }, [selectedRows])

    const tableData = useMemo(() => {
        return approved.map((item) => [
            item.TableID,
            item.MachineName,
            item.FormName,
            item.UserName || "-",
            convertToThaiDateTime(item.CreateDate),
            item.TableID,
        ]);
    }, [approved, debouncedSearchQuery]);

    const mutation = useMutation(SaveApporved, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries('approved');
        },
        onError: handleError,
    });

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "selected", align: "center" },
            { label: "Machine Name", align: "flex-start" },
            { label: "Form Name", align: "flex-start" },
            { label: "User", align: "flex-start" },
            { label: "Time Submit", align: "flex-start" },
            { label: "Preview", align: "center" },
        ],
        flexArr: [1, 2, 3, 2, 3, 1],
        actionIndex: [
            {
                selectIndex: 0,
                preIndex: 5,
            },
        ],
        handleAction,
        showMessage: [1, 2],
        searchQuery: debouncedSearchQuery,
        selectedRows,
        setRow,
    }), [tableData, debouncedSearchQuery, handleAction, setRow, selectedRows]);

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

    return (
        <AccessibleView name="container-checklist" style={styles.container}>
            <Card.Title
                title="List Acknowledged"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <Card.Content style={styles.cardcontent}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} handlePaginationChange={handlePaginationChange} />}
            </Card.Content>
        </AccessibleView>
    );
});

export default ApprovedScreen;

