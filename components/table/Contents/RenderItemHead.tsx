import React, { useCallback, useState } from "react";
import { Checkbox, DataTable } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useRes } from '@/app/contexts/useRes'
import Text from "../../Text";
import PickerDropdown from "../../common/PickerDropdown";
import { RenderItemHeadProps } from "@/typing/screens/CustomTable";
import { Dropdown } from "@/components/common";
import { useTheme } from "@/app/contexts/useTheme";

type justifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

const CustomtableHead = React.memo(({ Tablehead, flexArr, handleSort, sortColumn, sortDirection, selectedRows, toggleSelectAll, displayData, showFilter, filter, handelSetFilter, showData, showColumn,
    handleDialog, ShowTitle, showFilterDate, filteredDate, Dates, handleLoadMore, isFetchingNextPage, hasNextPage, handlefilter, searchfilter }: RenderItemHeadProps) => {
    const masterdataStyles = useMasterdataStyles();
    const { fontSize, responsive, spacing } = useRes();
    const { theme } = useTheme();
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
                                onPress={() => handleDialog("Approved")}
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

                <View style={{
                    flexDirection: responsive === "small" ? 'column' : 'row',
                }}>
                    {showFilterDate && (
                        <View style={{ width: 200 }}>
                            <Dropdown
                                label={`Date`}
                                search
                                open={openDate}
                                setOpen={(v: boolean) => setOpenDate(v)}
                                selectedValue={Dates}
                                items={filterDateOptions}
                                setSelectedValue={(value: string | null) => filteredDate(value)}
                            />
                        </View>
                    )}

                    {showFilter && (
                        <>
                            <View style={{ width: open ? 500 : 250 }}>
                                <Dropdown
                                    label={`${ShowTitle || "Title"}`}
                                    search
                                    open={open}
                                    setOpen={(v: boolean) => setOpen(v)}
                                    selectedValue={filter}
                                    items={showData || []}
                                    setSelectedValue={(value: string | null) => handelSetFilter(value)}
                                />
                            </View>
                        </>
                    )}
                </View>
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
