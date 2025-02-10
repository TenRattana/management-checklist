import React from 'react';
import { View, StyleSheet } from 'react-native';
import Dropdown from './Dropdown';
import useMasterdataStyles from '@/styles/common/masterdata';
import Text from '../Text';

const AdvancedFilter = ({ visible, setVisible, Title, lefticon, selectFilter, handelChangeFilter, width, selectFilterOption, search = false, isFetching, searchQuery, handleScroll, setDebouncedSearchQuery }: {
    visible: boolean, setVisible: (field: string, value: boolean) => void, Title: string, search?: boolean
    lefticon?: string, selectFilter: string | null, handelChangeFilter: (field: string, value: string | null) => void,
    width?: number | `${number}%`,
    selectFilterOption: { label: string, value: string }[],
    searchQuery?: string;
    isFetching?: boolean;
    fetchNextPage?: () => void;
    handleScroll?: ({ nativeEvent }: any) => void;
    setDebouncedSearchQuery?: (value: string) => void;
}) => {

    const masterdataStyles = useMasterdataStyles();

    const styles = StyleSheet.create({
        filterContent: {
            height: 65,
            marginVertical: 10,
        }
    });

    return (
        <View style={[styles.filterContent, { width: width ?? undefined }]}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold]}>{Title || ""}</Text>
            <View>
                <Dropdown
                    label={Title}
                    lefticon={lefticon}
                    search={search}
                    open={visible}
                    setOpen={(v: boolean) => setVisible(Title, v)}
                    selectedValue={selectFilter}
                    items={selectFilterOption}
                    setSelectedValue={(value: string | null) => handelChangeFilter(Title, value)}
                    handleScroll={handleScroll}
                    isFetching={isFetching}
                    searchQuery={searchQuery}
                    setDebouncedSearchQuery={setDebouncedSearchQuery}
                />
            </View>
        </View>
    )
};


export default AdvancedFilter;
