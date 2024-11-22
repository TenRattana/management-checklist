import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import Text from "@/components/Text";
import useMasterdataStyles from "@/styles/common/masterdata";
import useCustomtableStyles from "@/styles/customtable";
import Cellcontent from "./Contents/Cellcontent";
import Actioncontent from "./Contents/Actioncontent";
import { Dialogs } from "../common";
import { HandelPrssProps, CustomtableSmallProps } from "@/typing/tag";
import { useRes } from "@/app/contexts/useRes";
import { Picker } from "@react-native-picker/picker";

const CustomtableSmall: React.FC<CustomtableSmallProps> = React.memo(({ displayData, Tablehead, actionIndex, showMessage, handleDialog, selectedRows, handelSetFilter, filter, showColumn, showData, showFilter, toggleSelect }) => {

    const masterdataStyles = useMasterdataStyles();
    const customtable = useCustomtableStyles();
    const { fontSize, responsive } = useRes()

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

    const styles = StyleSheet.create({
        functionname: {
            textAlign: 'center'
        },
        cardcontent: {
            padding: 2,
            flex: 1
        }
    })

    const dropdownOptions = useMemo(() => {
        const uniqueOptions = new Set(showData?.map(row => row?.[showColumn || 0]));
        return Array.from(uniqueOptions);
    }, [showData, showColumn]);

    const renderSmallRes = useCallback((rowData: (string | number | boolean)[], rowIndex: number) => {
        return (
            <AccessibleView name={`container-${rowIndex}`} style={[customtable.cardRow, { alignItems: 'flex-start', paddingBottom: 10 }]}>
                {Tablehead.map((header, colIndex) => (
                    <AccessibleView name={`header-${rowIndex}-${colIndex}`} key={`cell-${rowIndex}-${colIndex}`} style={{ flex: 1, marginVertical: 5, paddingVertical: 5 }}>
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
                                                />
                                                <Actioncontent
                                                    data={String(rowData[colIndex])}
                                                    action={"delIndex"}
                                                    row={rowData}
                                                    rowIndex={rowIndex}
                                                    Canedit={rowData[Number(actionItem['disables'])]}
                                                    handlePress={handlePress}
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
                                                    toggleSelect={toggleSelect}
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
            <AccessibleView name="Approve" style={{
                flexDirection: 'column', justifyContent: 'space-between',
                marginHorizontal: '2%',
            }}>
                <AccessibleView name="" style={{ flexDirection: 'column', justifyContent: 'space-evenly' }}>
                    {selectedRows && selectedRows.length > 0 && (
                        <>
                            <TouchableOpacity
                                onPress={() => handleDialog("Apporved",)}
                                style={[
                                    masterdataStyles.backMain,
                                    masterdataStyles.buttonCreate,
                                    {
                                        backgroundColor: '#4CAF50',
                                        width: '100%',
                                        marginLeft: 0,
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
                                        width: '100%',
                                        marginLeft: 0,
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
                </AccessibleView>

                {showFilter && (
                    <AccessibleView name="filter" style={{ flexDirection: 'column', justifyContent: 'flex-end', marginVertical: 10 }}>
                        <Text style={[masterdataStyles.text, { alignContent: 'center', paddingRight: 15 }]}>{Tablehead[1].label}</Text>
                        <Picker
                            selectedValue={filter || ""}
                            onValueChange={(itemValue) => handelSetFilter(itemValue)}
                            style={[masterdataStyles.picker, { width: '100%', borderWidth: 0, borderBottomWidth: 1 }]}
                            mode="dropdown"
                            testID="picker-custom"
                            accessibilityLabel="Picker Accessibility Label"
                        >
                            <Picker.Item label="Select an option" value="" />
                            {dropdownOptions.map((option, index) => (
                                <Picker.Item key={index} label={String(option)} value={option} />
                            ))}
                        </Picker>
                    </AccessibleView>
                )}
            </AccessibleView>

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