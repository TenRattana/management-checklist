import React, { useCallback, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { DataTable, Text } from "react-native-paper";
import AccessibleView from "@/components/AccessibleView";
import useCustomtableStyles from "@/styles/customtable";
import Cellcontent from "./Contents/Cellcontent";
import { Dialogs } from "../common";
import { HandelPrssProps } from "@/typing/tag";
import Actioncontent from "./Contents/Actioncontent";
import { CustomtableDataProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from '@/app/contexts/useRes'
import { useTheme } from '@/app/contexts/useTheme'

type justifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

const CustomtableData: React.FC<CustomtableDataProps> = React.memo(({ Tablehead, flexArr, actionIndex, displayData, handleDialog, showMessage, selectedRows, toggleSelect, detail, detailKey, detailData }) => {
    const customtable = useCustomtableStyles();
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes()
    const { theme } = useTheme()
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [dialogAction, setDialogAction] = useState<string>("");
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [dialogTitle, setDialogTitle] = useState<string>("");
    const [dialogData, setDialogData] = useState<string>("");
    const [isDetailVisible, setIsDetailVisible] = useState<boolean[]>([])

    const handlePress = useCallback(({ action, data, message, visible, Change }: HandelPrssProps) => {
        setDialogAction(action);
        setDialogData(String(data));
        setDialogTitle(Change ? Change : action === "editIndex" ? "Edit" : action === "delIndex" ? "Delete" : "");
        const messages = Array.isArray(showMessage) ? showMessage.map(key => message[key]).join(" ") : message[showMessage];
        setDialogMessage(String(`${messages}`));
        setIsVisible((visible || action === "editIndex" || action === "changeIndex" || action === "copyIndex" || action === "preIndex"));
    }, [setDialogAction, setDialogData, setDialogTitle, setDialogMessage, setIsVisible, showMessage]);


    const styles = StyleSheet.create({
        containerdetail: {
            width: "100%",
            paddingTop: 20
        },
        containerdetailvalue: {
            paddingVertical: 4,
            marginBottom: 8,
            backgroundColor: "#fff",
            borderRadius: 4,
            padding: 8,
        },
        text: {
            paddingVertical: 5,
            fontFamily: 'Poppins',
            letterSpacing: 0.3
        },
        containerdetailkey: {
            backgroundColor: "#fff",
            borderRadius: 8,
            paddingHorizontal: 8
        },
        chipContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            marginVertical: 10,
        },
        chip: {
            backgroundColor: "#f0f8ff",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            marginRight: 8,
            marginBottom: 8,
        },
    })

    const renderTableData = useCallback((row: (string | number | boolean)[], rowIndex: number) => {

        const matchingIndex = detailData?.findIndex(item => {
            const itemValues = Object.values(item); 
            return row.every(value => itemValues.includes(value)); 
        }) ?? -1 ;
        
        return (
            <View key={`row-${rowIndex}`}>
                <DataTable.Row onPress={() => detail ? setIsDetailVisible((prev) => ({ ...prev, [matchingIndex]: !isDetailVisible[matchingIndex] })) : null} disabled={!detail} key={`data-row-${rowIndex}`} style={{ backgroundColor: theme.colors.background }}>
                    {row.map((cell, cellIndex) => {
                        const Align: justifyContent = Tablehead[cellIndex]?.align as justifyContent;
                        const justifyContent = {
                            justifyContent: Align,
                        };
                        return (
                            <DataTable.Cell key={`cell-${rowIndex}-${cellIndex}`} style={[justifyContent, { flex: flexArr[cellIndex] || 0 }]} disabled={!detail}>
                                {actionIndex.map((actionItem, index) => {
                                    const filteredEntries = Object.entries(actionItem).filter(([, value]) => value === cellIndex);
                                    return filteredEntries.length > 0
                                        ? filteredEntries.map(([key]) => {
                                            if (key === "editIndex" || key === "delIndex") {
                                                return (
                                                    <AccessibleView name={`action-${rowIndex}-${key}-${index}`} key={`action-${rowIndex}-${cellIndex}-${key}`} style={customtable.eventColumn}>
                                                        <Actioncontent
                                                            key={`action-${rowIndex}-${key}-${index}-editIndex`}
                                                            data={String(row[cellIndex])}
                                                            action={"editIndex"}
                                                            row={row}
                                                            rowIndex={rowIndex}
                                                            Canedit={row[Number(actionItem['disables'])]}
                                                            handlePress={handlePress}
                                                            selectedRows={selectedRows}
                                                        />
                                                        <Actioncontent
                                                            key={`action-${rowIndex}-${key}-${index}-delIndex`}
                                                            data={String(row[cellIndex])}
                                                            action={"delIndex"}
                                                            row={row}
                                                            rowIndex={rowIndex}
                                                            Canedit={row[Number(actionItem['disables'])]}
                                                            handlePress={handlePress}
                                                            selectedRows={selectedRows}
                                                        />
                                                    </AccessibleView>
                                                );
                                            } else {
                                                return (
                                                    <AccessibleView name={`anoter-action-${rowIndex}-${key}-${index}`} key={`action-${rowIndex}-${cellIndex}-${key}`} style={customtable.eventColumn}>
                                                        <Actioncontent
                                                            data={String(row[cellIndex])}
                                                            key={`anoter-action-${rowIndex}-${key}-${index}-${key}`}
                                                            action={key}
                                                            row={row}
                                                            rowIndex={rowIndex}
                                                            Canedit={row[Number(actionItem['disables'])]}
                                                            handlePress={handlePress}
                                                            selectedRows={selectedRows}
                                                            toggleSelect={toggleSelect}
                                                        />
                                                    </AccessibleView>
                                                )
                                            }
                                        })
                                        : <Cellcontent
                                            key={`cellcontent-${rowIndex}-${index}`}
                                            cell={cell}
                                            cellIndex={cellIndex}
                                            row={row}
                                            rowIndex={rowIndex}
                                            Canedit={row[Number(actionItem['disables'])]}
                                            handlePress={handlePress}
                                        />
                                })}
                            </DataTable.Cell>
                        );
                    })}
                </DataTable.Row>

                {isDetailVisible[matchingIndex] && detailKey?.some(key => detailData?.[matchingIndex]?.hasOwnProperty(key)) && (
                    <AccessibleView name="containerdetail" style={styles.containerdetail} key={`index-${matchingIndex}`}>
                        {Object.entries(detailData?.[matchingIndex] || {}).map(
                            ([key, value]) =>
                                detailKey.includes(key) && (
                                    <AccessibleView name="containerdetailkey"
                                        key={`detail-${matchingIndex}-${key}`}
                                        style={[styles.containerdetailkey]}
                                    >
                                        <Text
                                            style={[masterdataStyles.text, masterdataStyles.textBold, styles.text]}
                                            key={`detail-${matchingIndex}-${key}-${key.charAt(0).toUpperCase() + key.slice(1)}`}
                                        >
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </Text>

                                        {Array.isArray(value) ? (
                                            <AccessibleView name="chipContainer" style={styles.chipContainer}>
                                                {value.map((item, index) => (
                                                    <View id="chip" key={`chip-${matchingIndex}-${key}-${index}`} style={[styles.chip, { backgroundColor: theme.colors.field }]}>
                                                        {typeof item === "object" && item !== null ? (
                                                            Object.entries(item).map(([subKey, subValue]) => (
                                                                <Text key={`chip-${matchingIndex}-${key}-${index}-${subKey}`} style={[masterdataStyles.textFFF, styles.text]}>
                                                                    {subKey} : {String(subValue)}
                                                                </Text>
                                                            ))
                                                        ) : (
                                                            <Text style={[masterdataStyles.text, { paddingVertical: 5 }]}>{String(item)}</Text>
                                                        )}
                                                    </View>
                                                ))}
                                            </AccessibleView>
                                        ) : (
                                            <Text style={[masterdataStyles.text, styles.text]} key={`detail-${matchingIndex}-${key}-${value}`}>
                                                {String(value)}
                                            </Text>
                                        )}
                                    </AccessibleView>
                                )
                        )}
                    </AccessibleView>
                )}
            </View>
        );
    }, [Tablehead, flexArr, actionIndex, customtable.eventColumn, detail, detailKey, detailData]);

    return (
        <>
            <FlatList
                data={displayData.length > 0 ? displayData : []}
                renderItem={({ item, index }) => renderTableData(item, index)}
                keyExtractor={(item, index) => `key-${index}`}
                ListEmptyComponent={() => (
                    <Text style={[masterdataStyles.text, { textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 }]}>
                        No data found...
                    </Text>
                )}
                contentContainerStyle={{ flexGrow: 1 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                removeClippedSubviews
            />

            <Dialogs
                isVisible={isVisible}
                title={dialogTitle}
                setIsVisible={setIsVisible}
                handleDialog={handleDialog}
                actions={dialogAction}
                messages={dialogMessage}
                data={dialogData}
            />
        </>

    );
});

export default CustomtableData;
