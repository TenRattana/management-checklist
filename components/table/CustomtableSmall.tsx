import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import Text from "@/components/Text";
import useMasterdataStyles from "@/styles/common/masterdata";
import useCustomtableStyles from "@/styles/customtable";
import Cellcontent from "./Contents/Cellcontent";
import Actioncontent from "./Contents/Actioncontent";
import { Dialogs, Dropdown } from "../common";
import { HandelPrssProps, CustomtableSmallProps } from "@/typing/tag";
import { Picker } from "@react-native-picker/picker";
import DetailContent from "./Contents/Detailcontent";

const CustomtableSmall: React.FC<CustomtableSmallProps> = React.memo(({ displayData, Tablehead, actionIndex, showMessage, selectedRows, toggleSelect, detail, detailKey, detailData, detailKeyrow, showDetailwithKey,
    showFilter, filter, handelSetFilter, showData, showColumn, handlePaginationChange, handleDialog, ShowTitle, showFilterDate, filteredDate, Dates, handleLoadMore, isFetchingNextPage, hasNextPage, handlefilter, searchfilter
}) => {

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

    const styles = StyleSheet.create({
        functionname: {
            textAlign: 'center'
        },
        cardcontent: {
            padding: 2,
            flex: 1
        }
    })

    const filterDateOptions = ["Today", "This week", "This month"];

    const [open, setOpen] = useState(false);

    const findIndex = (row: (string | number | boolean)[]) => {
        return detailData?.findIndex(item => {
            return detailKey && item[detailKey] === (detailKeyrow && row[Number(detailKeyrow)]);
        }) ?? -1;
    };

    const handleScroll = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPage && !isFetchingNextPage && handleLoadMore) {
                handleLoadMore();
            }
        }
    };

    const renderSmallRes = useCallback((rowData: (string | number | boolean)[], rowIndex: number) => {
        return (
            <AccessibleView name={`container-${rowIndex}`} style={[customtable.cardRow, { alignItems: 'flex-start', paddingBottom: 10 }]}>
                {Tablehead.map((header, colIndex) => header.label !== "" && (
                    <AccessibleView name={`header-${rowIndex}-${colIndex}`} key={`cell-${rowIndex}-${colIndex}`} style={{ flex: 1, marginVertical: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={masterdataStyles.text}>{header.label} : </Text>
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

                {detail && (
                    <AccessibleView name="containerdetail" key={`index-${findIndex(rowData)}`} style={{ width: "100%" }}>
                        <DetailContent detailData={detailData?.[findIndex(rowData)] || []} showDetailwithKey={showDetailwithKey} />
                    </AccessibleView>
                )}
            </AccessibleView>
        );
    }, [actionIndex, Tablehead, detail, detailKey, detailData]);

    const getItemLayout = (data: any, index: number) => ({
        length: 159,
        offset: 159 * index,
        index,
    });

    return (
        <>
            <View id="Approve" style={{
                flexDirection: 'column', justifyContent: 'space-between',
                marginHorizontal: '2%',
                zIndex: 8,
            }}>
                <View style={{ flexDirection: 'column', justifyContent: 'space-evenly' }}>
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
                </View>

                <View style={{
                    flexDirection: 'column',
                }}>
                    {showFilterDate && (
                        <View id="filter" style={{
                            flexDirection: 'column',
                            marginTop: 20,
                        }}>
                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingRight: 15 }]}>Date</Text>
                            <Picker
                                style={{ width: '100%', borderWidth: 0, borderBottomWidth: 1, height: 35, alignSelf: 'center' }}
                                selectedValue={Dates || ""}
                                onValueChange={(itemValue) => filteredDate(itemValue)}
                                mode="dropdown"
                                testID="picker-custom"
                                accessibilityLabel="Picker Accessibility Label"
                            >
                                <Picker.Item label="Select all" value="" style={masterdataStyles.text} fontFamily="Poppins" />
                                {filterDateOptions.map((option, index) => (
                                    <Picker.Item key={`date-option-${index}`} label={option} value={option} style={masterdataStyles.text} fontFamily="Poppins" />
                                ))}
                            </Picker>
                        </View>
                    )}

                    {showFilter && (
                        <View id="filter" style={{
                            flexDirection: 'column',
                            marginVertical: 10,
                            zIndex: 8
                        }}>
                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingRight: 15 }]}>{`${ShowTitle || "Title"}`}</Text>
                            <Dropdown
                                mode="dialog"
                                label={ShowTitle || ""}
                                open={open}
                                setOpen={(v: boolean) => setOpen(v)}
                                selectedValue={filter}
                                items={showData || []}
                                searchQuery={searchfilter}
                                setDebouncedSearchQuery={(value) => handlefilter && handlefilter(value)}
                                setSelectedValue={(stringValue: string | null) => {
                                    handelSetFilter(stringValue)
                                }}
                                handleScroll={handleScroll}
                                showLefticon={true}
                            />
                        </View>
                    )}
                </View>
            </View>

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
                onEndReachedThreshold={0.2}
                initialNumToRender={30}
                // windowSize={50}
                // maxToRenderPerBatch={50}
                onEndReached={handlePaginationChange}
                getItemLayout={getItemLayout}
            />

            {isVisible && (
                <Dialogs
                    isVisible={isVisible}
                    title={dialogTitle}
                    setIsVisible={setIsVisible}
                    handleDialog={handleDialog}
                    actions={dialogAction}
                    messages={dialogMessage}
                    data={dialogData}
                />
            )}
        </>
    )
})

export default CustomtableSmall