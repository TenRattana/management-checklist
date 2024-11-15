import React, { useCallback, useState } from "react";
import { FlatList } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import Text from "@/components/Text";
import useMasterdataStyles from "@/styles/common/masterdata";
import useCustomtableStyles from "@/styles/customtable";
import Cellcontent from "./Contents/Cellcontent";
import Actioncontent from "./Contents/Actioncontent";
import { Dialogs } from "../common";
import { HandelPrssProps, CustomtableSmallProps } from "@/typing/tag";

const CustomtableSmall: React.FC<CustomtableSmallProps> = React.memo(({ displayData, Tablehead, actionIndex, showMessage, handleDialog, selectedRows }) => {

    const masterdataStyles = useMasterdataStyles();
    const customtable = useCustomtableStyles();

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
        setDialogMessage(String(messages));
        setIsVisible((visible || action === "editIndex" || action === "changeIndex" || action === "copyIndex" || action === "preIndex"));
    }, [setDialogAction, setDialogData, setDialogTitle, setDialogMessage, setIsVisible, showMessage]);

    const renderSmallRes = useCallback((rowData: (string | number | boolean)[], rowIndex: number) => {
        return (
            <AccessibleView name={`container-${rowIndex}`} style={[customtable.cardRow, { alignItems: 'flex-start' }]}>
                {Tablehead.map((header, colIndex) => (
                    <AccessibleView name={`header-${rowIndex}-${colIndex}`} key={`cell-${rowIndex}-${colIndex}`} style={{ flex: 1, paddingTop: -10 }}>
                        <Text style={[{ marginVertical: 5 }, masterdataStyles.text]}>{header.label}</Text>
                        {actionIndex.map((actionItem, index) => {
                            const filteredEntries = Object.entries(actionItem).filter(([, value]) => value === colIndex);
                            return filteredEntries.length > 0
                                ? filteredEntries.map(([key]) => {
                                    if (key === "editIndex" || key === "delIndex") {
                                        return (
                                            <AccessibleView name={`action-${rowIndex}-${colIndex}`} key={`action-${rowIndex}-${colIndex}-${key}`} style={customtable.eventColumn}>
                                                <Text style={[masterdataStyles.text, { alignSelf: "center", }]}>Action : </Text>
                                                <Actioncontent
                                                    data={String(rowData[colIndex])}
                                                    action={"editIndex"}
                                                    row={rowData}
                                                    rowIndex={rowIndex}
                                                    Canedit={rowData[Number(actionItem['disables'])]}
                                                    handlePress={handlePress}
                                                    selectedRows={selectedRows}
                                                />
                                                <Actioncontent
                                                    data={String(rowData[colIndex])}
                                                    action={"delIndex"}
                                                    row={rowData}
                                                    rowIndex={rowIndex}
                                                    Canedit={rowData[Number(actionItem['disables'])]}
                                                    handlePress={handlePress}
                                                    selectedRows={selectedRows}
                                                />
                                            </AccessibleView>
                                        );
                                    } else {
                                        return (
                                            <AccessibleView name={`anoter-action-${rowIndex}-${key}-${index}`} key={`action-${rowIndex}-${colIndex}-${key}`} style={customtable.eventColumn}>
                                                <Actioncontent
                                                    data={String(rowData[colIndex])}
                                                    action={key}
                                                    row={rowData}
                                                    rowIndex={rowIndex}
                                                    Canedit={rowData[Number(actionItem['disables'])]}
                                                    handlePress={handlePress}
                                                    selectedRows={selectedRows}
                                                />
                                            </AccessibleView>
                                        )
                                    }
                                })
                                : <Cellcontent
                                    key={`cellcontent-${rowIndex}-${index}`}
                                    cell={rowData[colIndex]}
                                    cellIndex={colIndex}
                                    row={rowData}
                                    rowIndex={rowIndex}
                                    Canedit={rowData[Number(actionItem['disables'])]}
                                    handlePress={handlePress}
                                />
                        })}
                    </AccessibleView>
                ))}
            </AccessibleView>
        );
    }, [actionIndex, Tablehead]);

    return (
        <>
            <FlatList
                data={displayData.length > 0 ? displayData : []}
                renderItem={({ item, index }) => renderSmallRes(item, index)}
                keyExtractor={(_, index) => `row-${index}`}
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
    )
})

export default CustomtableSmall