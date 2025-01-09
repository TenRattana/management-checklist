import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import useMasterdataStyles from '@/styles/common/masterdata';
import { Dropdown } from '@/components/common';
import { Picker } from '@react-native-picker/picker';
import { DebouncedFunc } from 'lodash';

const RenderItemSmallHead = React.memo(({ selectedRows, handleDialog, showFilterDate, Dates, filteredDate, showFilter, ShowTitle, filter, handlefilter, searchfilter, handleLoadMore, hasNextPage, isFetchingNextPage, showData, handelSetFilter }: {
    selectedRows?: string[], handleDialog: (action?: string, data?: string) => void, showFilterDate?: boolean, Dates?: string | null, filteredDate: DebouncedFunc<(value: string | null) => void>, showFilter?: boolean, ShowTitle?: string,
    filter?: string | null, handlefilter?: (value?: string) => void, searchfilter?: string, handleLoadMore?: (() => void), hasNextPage?: boolean, isFetchingNextPage?: boolean, showData?: any[], handelSetFilter: DebouncedFunc<(value: string | null) => void>
}) => {
    const masterdataStyles = useMasterdataStyles();

    const filterDateOptions = ["Today", "This week", "This month"];
    const [open, setOpen] = useState(false);

    const styles = StyleSheet.create({
        functionname: {
            textAlign: 'center'
        },
        cardcontent: {
            padding: 2,
            flex: 1
        }
    })

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

    return (
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
    )
})

export default RenderItemSmallHead
