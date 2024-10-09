import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView } from "@/components";
import { Card, Divider, Searchbar } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import { ExpectedResult } from "@/typing/type";
import { ExpectedResultProps } from "@/typing/tag";
import { useFocusEffect } from "expo-router";

const ExpectedResultScreen: React.FC<ExpectedResultProps> = ({ navigation }) => {
    const [expectedResult, setExpectedResult] = useState<ExpectedResult[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { colors } = useTheme();
    const { spacing } = useRes();

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const expectedResultResponse = await axiosInstance.post("ExpectedResult_service.asmx/GetExpectedResults");
            setExpectedResult(expectedResultResponse.data.data ?? []);
            showSuccess(String(expectedResultResponse.data.message))
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

    const handleAction = async (action?: string, item?: string) => {
        try {
            if (action === "preIndex") {
                const data = expectedResult.find((v) => v.TableID === item);
                navigation.navigate("Preview", {
                    formId: data?.FormID,
                    tableId: data?.TableID,
                });
            }
        } catch (error) {
            handleError(error);
        }
    };

    const convertToThaiDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear() + 543;
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} เวลา ${hours}:${minutes}`;
    };

    const tableData = useMemo(() => {
        return expectedResult.map((item) => [
            item.MachineName,
            item.FormName,
            convertToThaiDateTime(item.CreateDate),
            item.TableID,
        ]);
    }, [expectedResult, debouncedSearchQuery]);

    const tableHead = [
        { label: "Machine Name", align: "flex-start" },
        { label: "Form Name", align: "flex-start" },
        { label: "Time Submit", align: "flex-start" },
        { label: "Preview", align: "center" },
    ];

    const actionIndex = [
        {
            preIndex: 3,
        },
    ];

    const customtableProps = {
        Tabledata: tableData,
        Tablehead: tableHead,
        flexArr: [3, 3, 3, 1],
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
            { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>ExpectedResult
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
                </AccessibleView>
                <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>

        </ScrollView>
    );
};

export default React.memo(ExpectedResultScreen);

