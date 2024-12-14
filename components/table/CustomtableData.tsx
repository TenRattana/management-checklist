import React, { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { DataTable } from "react-native-paper";
import Text from "../Text";
import AccessibleView from "@/components/AccessibleView";
import useCustomtableStyles from "@/styles/customtable";
import Cellcontent from "./Contents/Cellcontent";
import { Dialogs } from "../common";
import { HandelPrssProps } from "@/typing/tag";
import Actioncontent from "./Contents/Actioncontent";
import { CustomtableDataProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useTheme } from '@/app/contexts/useTheme'
import DetailContent from "./Contents/Detailcontent";
import Animated, { Easing, FadeInUp, FadeOutDown } from "react-native-reanimated";

type justifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

FadeInUp.duration(300).easing(Easing.ease);
FadeOutDown.duration(300).easing(Easing.ease);

const CustomtableData: React.FC<CustomtableDataProps> = React.memo(({ Tablehead, flexArr, actionIndex, displayData, handleDialog, showMessage, selectedRows, toggleSelect, detail, detailKey, detailData, detailKeyrow, showDetailwithKey }) => {
    const customtable = useCustomtableStyles();
    const masterdataStyles = useMasterdataStyles();
    const { theme } = useTheme()
    const [dialogState, setDialogState] = useState({
        isVisible: false,
        action: "",
        message: "",
        title: "",
        data: "",
    });
    const [visibleDetails, setVisibleDetails] = useState<Set<number>>(new Set());

    const handlePress = useCallback(({ action, data, message, visible, Change }: HandelPrssProps) => {
        const title = Change || (action === "editIndex" ? "Edit" : action === "delIndex" ? "Delete" : "");
        const messages = Array.isArray(showMessage)
            ? showMessage.map((key) => message[key]).join(" ")
            : message[showMessage];

        setDialogState({
            isVisible: visible || ["editIndex", "changeIndex", "copyIndex", "preIndex"].includes(action),
            action,
            message: String(messages),
            title,
            data: String(data),
        });
    }, [showMessage]);

    const findIndex = (row: (string | number | boolean)[]) => {
        return detailData?.findIndex(item => {
            return detailKey && item[detailKey] === (detailKeyrow && row[Number(detailKeyrow)]);
        }) ?? -1;
    };

    const toggleDetailVisibility = useCallback((rowIndex: number) => {
        setVisibleDetails((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rowIndex)) {
                newSet.delete(rowIndex);
            } else {
                newSet.add(rowIndex);
            }
            return newSet;
        });
    }, []);

    const renderTableData = useCallback((row: (string | number | boolean)[], rowIndex: number) => {
        return (
            <View key={`row-${rowIndex}`} style={{ flex: 1 }}>
                <DataTable.Row onPress={() => detail && toggleDetailVisibility(findIndex(row))} disabled={!detail} style={{ backgroundColor: theme.colors.background }}>
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
                                                            data={String(row[cellIndex])}
                                                            action={"editIndex"}
                                                            row={row}
                                                            rowIndex={rowIndex}
                                                            Canedit={row[Number(actionItem['disables'])]}
                                                            handlePress={handlePress}
                                                            selectedRows={selectedRows}
                                                        />
                                                        <Actioncontent
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

                {visibleDetails.has(findIndex(row)) && (
                    <AccessibleView name="containerdetail" style={{ padding: 10 }}>
                        <Animated.View entering={FadeInUp} exiting={FadeOutDown}>
                            <DetailContent detailData={detailData?.[findIndex(row)] || []} showDetailwithKey={showDetailwithKey} />
                        </Animated.View>
                    </AccessibleView>
                )}
            </View>
        );
    }, [Tablehead, flexArr, actionIndex, customtable.eventColumn, detail, detailKey, detailData]);

    return (
        <>
            <FlatList
                data={displayData}
                renderItem={({ item, index }) => renderTableData(item, index)}
                keyExtractor={(item, index) => `key-${index}`}
                ListEmptyComponent={() => (
                    <Text style={[masterdataStyles.text, { textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 }]}>
                        No data found...
                    </Text>
                )}
                contentContainerStyle={{ flexGrow: 1 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                windowSize={10}
                onEndReachedThreshold={0.5}
                getItemLayout={(data, index) => ({ length: 58, offset: 58 * index, index })}
            />

            <Dialogs
                isVisible={dialogState.isVisible}
                title={dialogState.title}
                setIsVisible={() => setDialogState((prev) => ({...prev , isVisible: false}))}
                handleDialog={handleDialog}
                actions={dialogState.action}
                messages={dialogState.message}
                data={dialogState.data}
                key={`dialog-datatable`}
            />
        </>
    );
});

export default CustomtableData;
