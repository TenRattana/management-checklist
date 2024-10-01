import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, Searchbar } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";

interface ExpectedResultProps {
    navigation: any;
}

interface ExpectedResult {
    TableID: string;
    MachineID: string;
    MachineName: string;
    FormID: string;
    FormName: string;
    CreateDate: string;
}

const ExpectedResultScreen: React.FC<ExpectedResultProps> = ({ navigation }) => {
    const [expectedResult, setExpectedResult] = useState<ExpectedResult[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, showError } = useToast();
    const { colors } = useTheme();
    const { spacing } = useRes();

    const errorMessage = useCallback(
        (error: unknown) => {
            let errorMessage: string | string[];

            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.errors ?? ["Something went wrong!"];
            } else if (error instanceof Error) {
                errorMessage = [error.message];
            } else {
                errorMessage = ["An unknown error occurred!"];
            }

            showError(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
        },
        [showError]
    );

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const expectedResultResponse = await axiosInstance.post("ExpectedResult_service.asmx/GetExpectedResults");
            setExpectedResult(expectedResultResponse.data.data ?? []);
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (action?: string, item?: string) => {
        try {
            if (action === "preIndex") {
                const data = expectedResult.find((v) => v.TableID === item);
                navigation.navigate("View Form", {
                    formId: data?.FormID,
                    tableId: data?.TableID,
                });
            }
        } catch (error) {
            errorMessage(error);
        }
    };

    const handleNewForm = () => {
        navigation.navigate("Create Form");
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
    }, [expectedResult]);

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
        searchQuery,
    };

    return (
        <ScrollView>
            <Card>
                <Card.Title
                    titleStyle={[
                        masterdataStyles.text,
                        masterdataStyles.textBold,
                        { fontSize: spacing.large, textAlign: "center", marginTop: spacing.small, paddingTop: 10, marginBottom: spacing.small },
                    ]}
                    title="Expected Result"
                />
                <Card.Content>
                    <Searchbar
                        viewProps={
                            <Pressable
                                onPress={handleNewForm}
                                style={[masterdataStyles.button, masterdataStyles.backMain]}
                            >
                                <Text style={[masterdataStyles.text, masterdataStyles.textLight]}>New Form</Text>
                            </Pressable>
                        }
                        searchQuery={searchQuery}
                        handleChange={setSearchQuery}
                    />
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

export default React.memo(ExpectedResultScreen);

