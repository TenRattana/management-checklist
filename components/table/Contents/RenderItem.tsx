import React, { useState, useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { DataTable } from "react-native-paper";
import useCustomtableStyles from "@/styles/customtable";
import Cellcontent from "./Cellcontent";
import { HandelPrssProps } from "@/typing/tag";
import Actioncontent from "./Actioncontent";
import { useTheme } from "@/app/contexts/useTheme";
import DetailContent from "./Detailcontent";
import Animated, { Easing, FadeInUp, FadeOutDown, runOnJS } from "react-native-reanimated";
import { RenderItemProps } from "@/typing/screens/CustomTable";

type justifyContent =
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly"
    | undefined;

FadeInUp.duration(300).easing(Easing.ease);
FadeOutDown.duration(300).easing(Easing.ease);

const CellcontentMemo = React.memo(Cellcontent);
const ActionContentMemo = React.memo(Actioncontent);

const RenderItem = React.memo(({ item, index, Tablehead, flexArr, actionIndex, showMessage, selectedRows, toggleSelect, detail, detailKey, detailData, detailKeyrow, showDetailwithKey, setDialogState }: RenderItemProps) => {
    const { theme, darkMode } = useTheme();
    const customtable = useCustomtableStyles();

    const [visibleDetails, setVisibleDetails] = useState<Set<number>>(new Set());

    const handlePress = useCallback(({ action, data, message, visible, Change }: HandelPrssProps) => {
        const title = Change || (action === "editIndex" ? "Edit" : action === "delIndex" ? "Delete" : "");
        const messages = Array.isArray(showMessage)
            ? showMessage.map((key) => message[key]).join(" ")
            : message[showMessage];

        setDialogState(prevState => ({
            ...prevState,
            isVisible: visible || ["editIndex", "changeIndex", "copyIndex", "preIndex"].includes(action),
            action,
            message: String(messages),
            title,
            data: String(data),
        }));
    }, [showMessage]);

    const findIndex = useCallback((row: (string | number | boolean)[]) => {
        return (detailData?.findIndex((item) => detailKey && item[detailKey] === (detailKeyrow && row[Number(detailKeyrow)]))) ?? -1;
    }, [detailKey, detailData, detailKeyrow]);

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

    const styles = StyleSheet.create({
        container: { flex: 1 },
        containerRow: {
            backgroundColor: index % 2 === 0 ? !darkMode ? 'rgba(239, 239, 239, 0.32)' : 'rgba(0, 0, 20, 0.75)' : theme.colors.background,
            borderColor: item[Number(Tablehead.findIndex(v => v.label === "Status"))] || false ? theme.colors.succeass : theme.colors.error,
            borderBottomWidth: Platform.OS === "web" ? 1 : 0,
            elevation: 1,
            paddingHorizontal: 25
        }
    })

    return (
        <Animated.View key={`row-${index}`} style={styles.container}>
            <DataTable.Row
                onPress={() => detail && runOnJS(toggleDetailVisibility)(findIndex(item))}
                disabled={!detail}
                style={styles.containerRow}
            >
                {item.map((cell, cellIndex) => {
                    const Align = Tablehead[cellIndex]?.align as justifyContent;
                    const justifyContent = { justifyContent: cell === "-" ? "center" : Align };

                    return (
                        <DataTable.Cell
                            key={`cell-${index}-${cellIndex}`}
                            style={[justifyContent, { flex: flexArr[cellIndex] || 0 }]}
                            disabled={!detail}
                        >
                            {actionIndex.map((actionItem, index) => {

                                const actionProps = {
                                    data: String(cell),
                                    rowIndex: index,
                                    row: item,
                                    Canedit: item[Number(actionItem["disables"])] || false,
                                    Candel: item[Number(actionItem["delete"])],
                                    handlePress,
                                    selectedRows,
                                    toggleSelect,
                                };

                                const filteredEntries = Object.entries(actionItem).filter(([, value]) => value === cellIndex);

                                return filteredEntries.length > 0 ? filteredEntries.map(([key]) => {
                                    if (key === "editIndex" || key === "delIndex") {
                                        return (
                                            <View
                                                id={`action-${index}-${key}-${cellIndex}`}
                                                key={`action-${index}-${cellIndex}-${key}`}
                                                style={customtable.eventColumn}
                                            >
                                                <ActionContentMemo {...actionProps} action={'editIndex'} />
                                                <ActionContentMemo {...actionProps} action={'delIndex'} />
                                            </View>
                                        );
                                    } else {
                                        return (
                                            <View
                                                id={`another-action-${index}-${key}-${cellIndex}`}
                                                key={`action-${index}-${cellIndex}-${key}`}
                                                style={customtable.eventColumn}
                                            >
                                                <ActionContentMemo {...actionProps} action={key} />
                                            </View>
                                        );
                                    }
                                })
                                    : <CellcontentMemo
                                        key={`cellcontent-${index}-${cellIndex}`}
                                        cell={cell}
                                        cellIndex={cellIndex}
                                        row={item}
                                        rowIndex={index}
                                        Canedit={item[Number(actionItem["disables"])]}
                                        Candel={item[Number(actionItem["delete"])]}
                                        handlePress={handlePress}
                                    />
                            })}
                        </DataTable.Cell>
                    )
                })}
            </DataTable.Row>

            {visibleDetails.has(findIndex(item)) && (
                <View id="containerdetail" style={{ padding: 10, paddingLeft: 40 }}>
                    <Animated.View entering={FadeInUp} exiting={FadeOutDown}>
                        <DetailContent
                            detailData={detailData?.[findIndex(item)] || []}
                            showDetailwithKey={showDetailwithKey}
                        />
                    </Animated.View>
                </View>
            )}
        </Animated.View>
    );
});

export default RenderItem