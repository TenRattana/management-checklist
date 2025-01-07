import React, { useState } from "react";
import { Checkbox, DataTable, IconButton, Menu } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { FlatList, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRes } from '@/app/contexts/useRes'
import { TypeConfig } from "@/typing/type";
import { DebouncedFunc } from "lodash";
import Text from "../Text";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

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
        { label: "Today", value: "Today" },
        { label: "This week", value: "This week" },
        { label: "This month", value: "This month" },
    ];

    const mx = hp(Platform.OS === "web" ? '50%' : '40%');

    const styles = StyleSheet.create({
        functionname: {
            textAlign: 'center'
        },
        triggerButton: {
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomColor: 'gray',
            borderBottomWidth: 0.5,
        },
    });

    const handleScroll = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPage && !isFetchingNextPage && handleLoadMore) {
                handleLoadMore();
                console.log("A");

            }
        }
    };

    const renderItem = (item: { label: string, value: any }, field: string) => (
        <Menu.Item title={item.label} onPress={() => {
            field === "date" ? filteredDate(item.value) : handelSetFilter(item.value)
            field === "date" ? setOpenDate(false) : setOpen(false)
        }} titleStyle={masterdataStyles.text} />
    );

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

                <View style={{
                    flexDirection: responsive === "small" ? 'column' : 'row',
                    marginVertical: 5
                }}>
                    {showFilterDate && (
                        <View id="filter" style={{
                            justifyContent: 'flex-end',
                            flexDirection: responsive === "small" ? 'column' : 'row',
                            marginRight: responsive === "small" ? 0 : 10,
                        }}>
                            <View style={{ paddingRight: 10, alignItems: 'center', alignSelf: 'center' }}>
                                <Menu
                                    visible={openDate}
                                    onDismiss={() => setOpenDate(false)}
                                    anchor={
                                        <Text style={masterdataStyles.text}>Date :</Text>
                                    }
                                >
                                    <FlatList
                                        data={filterDateOptions}
                                        renderItem={({ item }) => renderItem(item, "date")}
                                        keyExtractor={(item) => item.value}
                                        style={{ maxHeight: mx }}
                                        onEndReachedThreshold={0.5}
                                    />
                                </Menu>
                            </View>

                            <TouchableOpacity onPress={() => setOpenDate(true)} style={styles.triggerButton}>
                                <Text style={[masterdataStyles.text]}>{Dates || "Select all"}</Text>
                                <IconButton style={[masterdataStyles.icon, { right: 8, flex: 1, alignItems: 'flex-end' }]} icon="chevron-down" size={spacing.large} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {showFilter && (
                        <View id="filter" style={{
                            flexDirection: responsive === "small" ? 'column' : 'row',
                            justifyContent: 'flex-end',
                            marginLeft: responsive === "small" ? 0 : 10,
                            marginVertical: 5
                        }}>
                            <View style={{ paddingRight: 10, alignItems: 'center', alignSelf: 'center' }}>
                                <Menu
                                    visible={open}
                                    onDismiss={() => setOpen(false)}
                                    anchor={
                                        <Text style={masterdataStyles.text}>{`${ShowTitle || "Title"} :`}</Text>
                                    }
                                >
                                    <FlatList
                                        data={showData || []}
                                        renderItem={({ item }) => renderItem(item, "filter")}
                                        keyExtractor={(item) => item.value}
                                        onEndReached={handleScroll}
                                        onScroll={handleScroll}
                                        style={{ maxHeight: mx }}
                                        onEndReachedThreshold={0.5}
                                    />
                                </Menu>
                            </View>

                            <TouchableOpacity onPress={() => setOpen(true)} style={styles.triggerButton}>
                                <Text style={[masterdataStyles.text]}>{filter || "Select all"}</Text>
                                <IconButton style={[masterdataStyles.icon, { right: 8, flex: 1, alignItems: 'flex-end' }]} icon="chevron-down" size={spacing.large} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

            </View >

            <DataTable>
                <DataTable.Header>
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
