import React, { useState, useCallback } from "react";
import { DataTable } from "react-native-paper";
import Text from "@/components/Text";
import useMasterdataStyles from "@/styles/common/masterdata";
import AccessibleView from "@/components/AccessibleView";

type justifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

interface CustomTableHeadProps {
    Tablehead: { label?: string; align?: string }[];
    flexArr: number[];
    handleSort: (index: number) => void;
    sortColumn: number | null;
    sortDirection: "ascending" | "descending" | undefined;
}

const CustomtableHead: React.FC<CustomTableHeadProps> = React.memo(({ Tablehead, flexArr, handleSort, sortColumn, sortDirection }) => {

    const masterdataStyles = useMasterdataStyles();

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
                                style={[{ flex: flexArr[index] || 0 }, justifyContent]}
                            >
                                <Text style={[masterdataStyles.textBold, masterdataStyles.text]}>{header.label}</Text>
                                {sortColumn === index && (sortDirection === "ascending" ? " ▲" : " ▼")}
                            </DataTable.Title>
                        )
                    })}
                </DataTable.Header>
            </DataTable>
        </AccessibleView>
    )
})

export default CustomtableHead
