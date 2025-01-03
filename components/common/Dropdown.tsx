import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Platform, Modal, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { HelperText, IconButton, Portal, Text } from 'react-native-paper';
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

const Dropdown = React.memo(({
    label,
    fetchNextPage,
    handleScroll,
    isFetching,
    items,
    open,
    search,
    setOpen,
    selectedValue,
    setSelectedValue,
    setDebouncedSearchQuery,
    error,
    searchQuery,
    errorMessage,
    lefticon,
    showLefticon
}: {
    search?: boolean;
    label: string;
    open: boolean;
    setOpen: (v: boolean) => void;
    selectedValue: any;
    items: { label: string; value: string, icon?: () => JSX.Element }[];
    setSelectedValue: (value: string | null) => void;
    isFetching?: boolean;
    fetchNextPage?: () => void;
    handleScroll?: ({ nativeEvent }: any) => void;
    setDebouncedSearchQuery?: (value: string) => void;
    error?: boolean;
    searchQuery?: string;
    errorMessage?: string;
    lefticon?: string;
    showLefticon?: boolean;

}) => {
    DropDownPicker.setListMode("FLATLIST");
    const [searchQuerys, setSearchQuery] = useState('');
    const masterdataStyles = useMasterdataStyles();
    const { theme, darkMode } = useTheme();
    const { spacing } = useRes();

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    useEffect(() => {
        searchQuery && setSearchQuery(searchQuery)
    }, [searchQuery]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery && setDebouncedSearchQuery(searchQuerys);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuerys]);

    // const sortedItems = selectedValue
    //     ? [
    //         items.find(item => item.value === selectedValue),
    //         ...items.filter(item => item.value !== selectedValue)
    //     ]
    //     : items;

    const filteredItems = items.filter(item =>
        searchQuerys === "" ? item : item.label.toLowerCase().includes(searchQuerys.toLowerCase())
    );

    return (
        <View id="inputs" style={masterdataStyles.commonContainer}>
            <View style={Platform.OS !== 'android' ? { zIndex: 10 } : {}}>
                <Portal>
                    <Modal
                        visible={open}
                        transparent={true}
                        onRequestClose={() => setOpen(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <DropDownPicker
                                    multiple={false}
                                    maxHeight={hp(Platform.OS === "web" ? '50%' : '70%')}
                                    open={open}
                                    value={selectedValue ? String(selectedValue) : null}
                                    items={filteredItems}
                                    theme={darkMode ? 'DARK' : 'LIGHT'}
                                    searchable={search ?? true}
                                    searchTextInputProps={{
                                        value: searchQuerys,
                                        onChangeText: handleSearch,
                                    }}
                                    searchTextInputStyle={{ fontFamily: 'Poppins', fontSize: spacing.small, borderRadius: 5, padding: 10, borderWidth: 0.01 }}
                                    searchPlaceholder={`Search for a ${label}...`}
                                    style={{ padding: 10, borderRadius: 0 }}
                                    textStyle={{
                                        fontFamily: 'Poppins', fontSize: spacing.medium, padding: 5,
                                        marginVertical: 5,
                                    }}
                                    containerStyle={{ flex: 1 }}
                                    setValue={() => { }}
                                    setOpen={() => setOpen(true)}
                                    placeholder={`Select for a ${label}...`}
                                    loading={isFetching}
                                    renderListItem={({ item }) => (
                                        <TouchableOpacity
                                            style={{
                                                paddingVertical: selectedValue === item.value ? 30 : 15,
                                                paddingHorizontal: 15,
                                                borderBottomWidth: 1,
                                                backgroundColor: selectedValue === item.value ? theme.colors.drag : undefined,
                                                borderBottomColor: selectedValue === item.value ? theme.colors.onBackground : '#d0d0d0',
                                                justifyContent: 'center'
                                            }}
                                            onPress={() => {
                                                setSelectedValue(String(item.value));
                                                setOpen(false);
                                            }}
                                        >
                                            <Text style={masterdataStyles.text}>{item.label}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={() => <Text>No data found</Text>}
                                    onOpen={fetchNextPage}
                                    onClose={() => setOpen(false)}
                                    flatListProps={{
                                        data: filteredItems,
                                        keyExtractor: (item) => `${item.value}`,
                                        onScroll: handleScroll,
                                        onEndReached: handleScroll,
                                        onEndReachedThreshold: 0.5,
                                        initialNumToRender: 10,
                                        maxToRenderPerBatch: 10,
                                        windowSize: 5,
                                        nestedScrollEnabled: true
                                    }}
                                    selectedItemContainerStyle={{
                                        backgroundColor: "grey"
                                    }}
                                    selectedItemLabelStyle={{
                                        fontWeight: "bold"
                                    }}
                                    bottomOffset={100}
                                />
                            </View>
                        </View>
                    </Modal>
                </Portal>

                <TouchableOpacity onPress={() => setOpen(true)} style={styles.triggerButton}>
                    {!showLefticon && (
                        <IconButton
                            style={masterdataStyles.icon}
                            icon={items.find((v) => v.value === selectedValue)?.icon || lefticon || "check-all"}
                            size={spacing.large}
                        />
                    )}

                    <Text style={[masterdataStyles.text]}>{selectedValue ? `${items.find((v) => v.value === selectedValue)?.label}` : `Select a ${label}`}</Text>

                    {!showLefticon && selectedValue ? (
                        <IconButton
                            style={[masterdataStyles.icon, { right: 8, flex: 1, alignItems: 'flex-end' }]}
                            icon="window-close"
                            size={spacing.large}
                            onPress={() => {
                                setSelectedValue("");
                            }}
                        />
                    ) : (
                        <IconButton style={[masterdataStyles.icon, { right: 8, flex: 1, alignItems: 'flex-end' }]} icon="chevron-down" size={spacing.large} />
                    )}
                </TouchableOpacity>
            </View>

            <HelperText
                type="error"
                visible={error}
                style={[{ display: error ? 'flex' : 'none' }, masterdataStyles.errorText]}
            >
                {errorMessage}
            </HelperText>
        </View>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.selectedValue === nextProps.selectedValue &&
        prevProps.items === nextProps.items &&
        prevProps.open === nextProps.open &&
        prevProps.searchQuery === nextProps.searchQuery
    );
});

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        width: 800,
        height: 50,
        padding: 20,
        top: -250,
        justifyContent: 'center',
    },
    triggerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
    },
});

export default Dropdown;
