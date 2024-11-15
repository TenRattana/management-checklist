import React, { useState, useCallback } from "react";
import { Checkbox, DataTable } from "react-native-paper";
import Text from "@/components/Text";
import useMasterdataStyles from "@/styles/common/masterdata";
import AccessibleView from "@/components/AccessibleView";
import { View } from "react-native";
import { useRes } from '@/app/contexts'

type justifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

interface CustomTableHeadProps {
    Tablehead: { label?: string; align?: string }[];
    flexArr: number[];
    handleSort: (index: number) => void;
    sortColumn: number | null;
    sortDirection: "ascending" | "descending" | undefined;
    selectedRows: string[];
    toggleSelectAll: () => void;
    displayData: (string | number | boolean)[][]
}


const CustomtableHead: React.FC<CustomTableHeadProps> = React.memo(({ Tablehead, flexArr, handleSort, sortColumn, sortDirection, selectedRows, toggleSelectAll, displayData }) => {
    const masterdataStyles = useMasterdataStyles();

    const { fontSize } = useRes()

    return (
        <AccessibleView name="container-datahead">
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
                                            status={selectedRows.length === displayData.length ? 'checked' : 'unchecked'}
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
        </AccessibleView>
    )
})

export default CustomtableHead
