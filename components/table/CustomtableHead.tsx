import React, { useMemo } from "react";
import { Checkbox, DataTable } from "react-native-paper";
import Text from "@/components/Text";
import useMasterdataStyles from "@/styles/common/masterdata";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useRes } from '@/app/contexts/useRes'
import { Picker } from "@react-native-picker/picker";
import { TypeConfig } from "@/typing/type";

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
    handelSetFilter: (value: string) => void;
    showData?: TypeConfig[];
    showColumn?: string;
    handleDialog: (action?: string, data?: string) => void;
    ShowTitle?: string;
}

const CustomtableHead: React.FC<CustomTableHeadProps> = React.memo(({ Tablehead, flexArr, handleSort, sortColumn, sortDirection, selectedRows, toggleSelectAll, displayData, showFilter, filter, handelSetFilter, showData, showColumn, handleDialog, ShowTitle }) => {
    const masterdataStyles = useMasterdataStyles();

    const { fontSize, responsive } = useRes()

    const dropdownOptions = useMemo(() => {
        const uniqueOptions = new Set(showData?.map(row => row?.[showColumn || 0]));
        return Array.from(uniqueOptions);
    }, [showData, showColumn]);

    const styles = StyleSheet.create({
        functionname: {
            textAlign: 'center'
        },
        cardcontent: {
            padding: 2,
            flex: 1
        }
    })

    return (
        <View id="container-datahead">
            <View id="Approve" style={{
                flexDirection: responsive === "small" ? 'column' : 'row', justifyContent: 'space-between',
                marginHorizontal: responsive === "small" ? '2%' : 0,

            }}>
                <View id="" style={{ flexDirection: responsive === "small" ? 'column' : 'row' }}>
                    {selectedRows && selectedRows.length > 0 && (
                        <>
                            <TouchableOpacity
                                onPress={() => handleDialog("Apporved",)}
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

                {showFilter && (
                    <View id="filter" style={{
                        flexDirection: responsive === "small" ? 'column' : 'row', justifyContent: 'flex-end', marginBottom: 10,
                        marginLeft: responsive === "small" ? 0 : 10,
                    }}>
                        <Text style={[masterdataStyles.text, { alignContent: 'center', paddingRight: 15, alignSelf: 'center' }]}>{ShowTitle || "Title"}</Text>
                        <Picker
                            itemStyle={masterdataStyles.text}
                            selectedValue={filter || ""}
                            onValueChange={(itemValue) => handelSetFilter(itemValue)}
                            style={[masterdataStyles.picker, { width: responsive === "small" ? '100%' : 300, borderWidth: 0, borderBottomWidth: 1, top: -2 }]}
                            mode="dropdown"
                            testID="picker-custom"
                            accessibilityLabel="Picker Accessibility Label"
                        >
                            <Picker.Item label="Select all" value="" />
                            {dropdownOptions.map((option, index) => (
                                <Picker.Item key={`item-${index}`} label={String(option)} value={option} />
                            ))}
                        </Picker>
                    </View>
                )}
            </View>

            <DataTable>
                <DataTable.Header>
                    {Tablehead.map((header, index) => {
                        const Align: justifyContent = Tablehead[index]?.align as justifyContent;
                        const justifyContent = {
                            justifyContent: Align,
                        };
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
        </View>
    )
})

export default CustomtableHead
