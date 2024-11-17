import React, { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "@/config/axios";
import { useToast, useRes } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { ExpectedResult } from "@/typing/type";
import { ExpectedResultProps } from "@/typing/tag";
import { useQuery } from 'react-query';
import { StyleSheet, TouchableOpacity } from "react-native";

const fetchExpectedResults = async (): Promise<ExpectedResult[]> => {
    const response = await axiosInstance.post("ExpectedResult_service.asmx/GetExpectedResults");
    return response.data.data ?? [];
};

const ApprovedScreen: React.FC<ExpectedResultProps> = React.memo(({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();

    const { data: expectedResult = [], isLoading } = useQuery<ExpectedResult[], Error>(
        'expectedResult',
        fetchExpectedResults,
        {
            refetchOnWindowFocus: true,
        });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        const data = expectedResult.find((v) => v.TableID === item);

        try {
            if (action === "preIndex") {
                if (data) {
                    navigation.navigate("Preview", {
                        formId: data.FormID,
                        tableId: data.TableID,
                    });
                }
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, expectedResult]);

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
        return expectedResult.map((item) => [
            item.TableID,
            item.MachineName,
            item.FormName,
            item.UserName ?? "-",
            convertToThaiDateTime(item.CreateDate),
            item.TableID,
        ]);
    }, [expectedResult, debouncedSearchQuery]);

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
        showFilter:true,
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

    const handelApporve = useCallback(() => {
        console.log(selectedRows);

    }, [])

    return (
        <AccessibleView name="container-checklist" style={styles.container}>
            <Card.Title
                title="List Apporved"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Expected Result..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-er"
                />
                {selectedRows.length > 0 && (
                    <AccessibleView name="" style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 }}>
                        <TouchableOpacity
                            onPress={handelApporve}
                            style={[
                                masterdataStyles.backMain,
                                masterdataStyles.buttonCreate,
                                {
                                    backgroundColor: '#4CAF50', // Green for Approve button
                                    borderRadius: 8,             // Rounded corners
                                    paddingVertical: 12,         // Increase padding for better touch area
                                    paddingHorizontal: 20,
                                    elevation: 3                 // Adds shadow on Android
                                },
                            ]}
                        >
                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>
                                Approve
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setSelectedRows([])}
                            style={[
                                masterdataStyles.backMain,
                                masterdataStyles.buttonCreate,
                                {
                                    backgroundColor: '#F44336', 
                                    borderRadius: 8,
                                    paddingVertical: 12,
                                    paddingHorizontal: 20,
                                    marginLeft: 10,          
                                    elevation: 3
                                },
                            ]}
                        >
                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>
                                Cancel Select
                            </Text>
                        </TouchableOpacity>
                    </AccessibleView>
                )}

            </AccessibleView>
            <Card.Content style={styles.cardcontent}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>
        </AccessibleView>
    );
});

export default ApprovedScreen;

