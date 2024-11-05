import React, { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { DataTable } from "react-native-paper";
import AccessibleView from "@/components/AccessibleView";
import Text from "@/components/Text";
import useCustomtableStyles from "@/styles/customtable";
import Cellcontent from "./Contents/Cellcontent";
import { Dialogs } from "../common";
import { HandelPrssProps } from "@/typing/tag";
import Actioncontent from "./Contents/Actioncontent";
import { CustomtableDataProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";

type justifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

const CustomtableData: React.FC<CustomtableDataProps> = React.memo(({ Tablehead, flexArr, actionIndex, displayData, handleDialog, showMessage }) => {
    const customtable = useCustomtableStyles();
    const masterdataStyles = useMasterdataStyles();

    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [dialogAction, setDialogAction] = useState<string>("");
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [dialogTitle, setDialogTitle] = useState<string>("");
    const [dialogData, setDialogData] = useState<string>("");

    const handlePress = useCallback(({ action, data, message, visible }: HandelPrssProps) => {
        setDialogAction(action);
        setDialogData(String(data));
        setDialogTitle(action === "editIndex" ? "Edit" : action === "delIndex" ? "Delete" : "");
        const messages = Array.isArray(showMessage) ? showMessage.map(key => message[key]).join(" ") : message[showMessage];
        setDialogMessage(String(`${messages}`));
        setIsVisible((visible || action === "editIndex" || action === "changeIndex" || action === "copyIndex" || action === "preIndex"));
    }, [setDialogAction, setDialogData, setDialogTitle, setDialogMessage, setIsVisible, showMessage]);

    const renderTableData = useCallback((row: (string | number | boolean)[], rowIndex: number) => {
        return (
            <DataTable.Row>
                {row.map((cell, cellIndex) => {
                    const Align: justifyContent = Tablehead[cellIndex]?.align as justifyContent;
                    const justifyContent = {
                        justifyContent: Align,
                    };
                    return (
                        <DataTable.Cell key={`cell-${rowIndex}-${cellIndex}`} style={[justifyContent, { flex: flexArr[cellIndex] || 0 }]}>

                            {actionIndex.map((actionItem, index) => {
                                const filteredEntries = Object.entries(actionItem).filter(([, value]) => value === cellIndex);
                                return filteredEntries.length > 0
                                    ? filteredEntries.map(([key]) => {
                                        if (key === "editIndex" || key === "delIndex") {
                                            return (
                                                <AccessibleView name={`action-${rowIndex}-${key}-${index}`} key={`action-${rowIndex}-${cellIndex}-${key}`} style={customtable.eventColumn}>
                                                    <Actioncontent
                                                        data={String(row[cellIndex])}
                                                        action={"editIndex"}
                                                        row={row}
                                                        rowIndex={rowIndex}
                                                        Canedit={row[Number(actionItem['disables'])]}
                                                        handlePress={handlePress}
                                                    />
                                                    <Actioncontent
                                                        data={String(row[cellIndex])}
                                                        action={"delIndex"}
                                                        row={row}
                                                        rowIndex={rowIndex}
                                                        Canedit={row[Number(actionItem['disables'])]}
                                                        handlePress={handlePress}
                                                    />
                                                </AccessibleView>
                                            );
                                        } else {
                                            return (<AccessibleView name={`anoter-action-${rowIndex}-${key}-${index}`} key={`action-${rowIndex}-${cellIndex}-${key}`} style={customtable.eventColumn}>
                                                <Actioncontent
                                                    data={String(row[cellIndex])}
                                                    action={key}
                                                    row={row}
                                                    rowIndex={rowIndex}
                                                    Canedit={row[Number(actionItem['disables'])]}
                                                    handlePress={handlePress}
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
                            }
                            )}
                        </DataTable.Cell>
                    );
                })}

            </DataTable.Row>
        );
    }, [Tablehead, flexArr, actionIndex, customtable.eventColumn]);

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
