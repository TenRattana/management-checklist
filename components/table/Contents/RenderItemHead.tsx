import React, { useCallback, useState } from "react";
import { Checkbox, DataTable } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRes } from '@/app/contexts/useRes'
import { TypeConfig } from "@/typing/type";
import { DebouncedFunc } from "lodash";
import Text from "../../Text";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useTheme } from "@/app/contexts/useTheme";
import PickerDropdown from "../../common/PickerDropdown";

type justifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

interface CustomTableHeadProps {
    Tablehead: { label?: string; align?: string }[];
    flexArr: number[];
    handleSort: (index: number) => void;
    sortColumn: number | null;
    sortDirection: "ascending" | "descending" | undefined;
    selectedRows?: string[];
    toggleSelectAll?: () => void;
    displayData: (string | number | boolean)[][];
    showFilter?: boolean;
    filter?: string | null;
    handelSetFilter: DebouncedFunc<(value: string | null) => void>
    showData?: TypeConfig[];
    showColumn?: string;
    handleDialog: (action?: string, data?: string) => void;
    ShowTitle?: string;
    showFilterDate?: boolean;
    filteredDate: DebouncedFunc<(value: string | null) => void>
    Dates?: string | null;
    handleLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    handlefilter?: (value?: string) => void;
    searchfilter?: string;
}

const CustomtableHead: React.FC<CustomTableHeadProps> = React.memo(({
    Tablehead,
    flexArr,
    handleSort,
    sortColumn,
    sortDirection,
    selectedRows,
    toggleSelectAll,
    displayData,
    showFilter,
    filter,
    handelSetFilter,
    showData,
    showColumn,
    handleDialog,
    ShowTitle,
    showFilterDate,
    filteredDate,
    Dates,
    handleLoadMore,
    isFetchingNextPage,
    hasNextPage,
    handlefilter,
    searchfilter
}) => {
    const masterdataStyles = useMasterdataStyles();
    const { fontSize, responsive, spacing } = useRes();
    const [open, setOpen] = useState(false);
    const [openDate, setOpenDate] = useState(false);

    const filterDateOptions = [
        { label: "Select all", value: "" },
        { label: "Today", value: "Today" },
        { label: "This week", value: "This week" },
        { label: "This month", value: "This month" },
    ];

    const styles = StyleSheet.create({
        functionname: {
            textAlign: 'center'
        },
        triggerButton: {
            flexDirection: 'row',
            alignItems: 'center',
        },
    });

    const handleScroll = useCallback(({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPage && !isFetchingNextPage && handleLoadMore) {
                handleLoadMore();
            }
        }
    }, []);

    return (
        <View id="container-datahead">
            <View id="Approve" style={{
                flexDirection: responsive === "small" ? 'column' : 'row',
                justifyContent: 'space-between',
                marginHorizontal: responsive === "small" ? '2%' : 0,
            }}>
                <View id="" style={{ flexDirection: responsive === "small" ? 'column' : 'row' }}>
                    {selectedRows && selectedRows.length > 0 && (
                        <>
                            <TouchableOpacity
                                onPress={() => handleDialog("Apporved")}
                                style={[
                                    masterdataStyles.backMain,
                                    masterdataStyles.buttonCreate,
                                    {
                                        backgroundColor: '#4CAF50',
                                        width: responsive === "small" ? '100%' : undefined,
                                        marginLeft: responsive === "small" ? 0 : 15,
                                        borderRadius: 8,
                                        paddingVertical: 12,
                                        paddingHorizontal: 20,
                                        elevation: 3
                                    },
                                ]}
                            >
                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>
                                    {`Approve : ${String(selectedRows.length)}`}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleDialog("ResetRow")}
                                style={[
                                    masterdataStyles.backMain,
                                    masterdataStyles.buttonCreate,
                                    {
                                        backgroundColor: '#F44336',
                                        width: responsive === "small" ? '100%' : undefined,
                                        marginLeft: responsive === "small" ? 0 : 10,
                                        borderRadius: 8,
                                        paddingVertical: 12,
                                        paddingHorizontal: 20,
                                        elevation: 3
                                    },
                                ]}
                            >
                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>
                                    Cancel Select
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* {showFilterDate || showFilter && ( */}
                <View style={{
                    flexDirection: responsive === "small" ? 'column' : 'row',
                    // marginVertical: 2
                }}>
                    {showFilterDate && (
                        <PickerDropdown
                            label="Date"
                            handelSetFilter={(value: string) => filteredDate(value)}
                            open={openDate}
                            setOpen={(v: boolean) => setOpenDate(v)}
                            value={Dates}
                            values={filterDateOptions}
                            key={`picker-date`}
                        />
                    )}

                    {showFilter && (
                        <PickerDropdown
                            label={`${ShowTitle || "Title"}`}
                            handelSetFilter={(value: string) => handelSetFilter(value)}
                            open={open}
                            setOpen={(v: boolean) => setOpen(v)}
                            value={filter}
                            values={showData || []}
                            search
                            handleScroll={handleScroll}
                            key={`picker-data`}
                        />
                    )}
                </View>
                {/* )} */}
            </View >

            <DataTable>
                <DataTable.Header style={{ paddingHorizontal: 25 }}>
                    {Tablehead.map((header, index) => {
                        const Align: justifyContent = Tablehead[index]?.align as justifyContent;
                        const justifyContent = { justifyContent: Align };
                        return (
                            <DataTable.Title
                                key={`header-${index}`}
                                onPress={() => handleSort(index)}
                                style={[{ flex: flexArr[index] || 0, alignSelf: 'center', alignItems: 'center', }, justifyContent]}
                            >
                                {header.label === "selected" ? (
                                    <View style={{ top: fontSize === "small" ? -5 : fontSize === "medium" ? -7 : -7 }}>
                                        <Checkbox
                                            status={selectedRows?.length === displayData.length && displayData.length > 0 ? 'checked' : 'unchecked'}
                                            onPress={toggleSelectAll}
                                        />
                                    </View>
                                ) : (
                                    <>
                                        <Text style={[masterdataStyles.textBold, masterdataStyles.text]}>{header.label}</Text>
                                        {sortColumn === index && (sortDirection === "ascending" ? " ▲" : " ▼")}
                                    </>
                                )}

                            </DataTable.Title>
                        )
                    })}
                </DataTable.Header>
            </DataTable>
        </View >
    );
});

export default CustomtableHead;
