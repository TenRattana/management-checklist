import { useRes } from '@/app/contexts/useRes';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { HelperText, IconButton, Portal } from 'react-native-paper';

const Dropdown = React.memo(({
    label,
    fetchNextPage,
    handleScroll,
    isFetching,
    items,
    open,
    setOpen,
    selectedValue,
    setSelectedValue,
    setDebouncedSearchQuery,
    error,
    errorMessage,
    lefticon
}: {
    label: string;
    open: boolean;
    setOpen: (v: boolean) => void;
    selectedValue: any;
    items: { label: string; value: string, icon?: () => JSX.Element }[];
    setSelectedValue: (value: string | null) => void;
    isFetching: boolean;
    fetchNextPage: () => void;
    handleScroll: ({ nativeEvent }: any) => void;
    setDebouncedSearchQuery: (value: string) => void;
    error?: boolean;
    errorMessage?: string;
    lefticon?: string
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes()
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    return (
        <View id="inputs" style={masterdataStyles.commonContainer}>
            <View style={Platform.OS !== 'android' ? { zIndex: 10 } : {}}>

                <Portal>
                    <Modal
                        visible={open}
                        animationType="fade"
                        transparent={true}
                        onRequestClose={() => setOpen(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <DropDownPicker
                                    multiple={false}
                                    maxHeight={500}
                                    open={open}
                                    value={selectedValue ? String(selectedValue) : null}
                                    items={items}
                                    containerStyle={{ flex: 1 }}
                                    setValue={() => { }}
                                    setOpen={() => setOpen(true)}
                                    placeholder={`Select for a ${label}...`}
                                    loading={isFetching}
                                    searchable={true}
                                    searchTextInputProps={{
                                        value: searchQuery,
                                        onChangeText: handleSearch,
                                    }}
                                    renderListItem={({ item }) => (
                                        <TouchableOpacity
                                            style={{ padding: 15 }}
                                            onPress={() => {
                                                setSelectedValue(String(item.value));
                                                setOpen(false);
                                            }}
                                        >
                                            <Text style={masterdataStyles.text}>{item.label}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={() => <Text>No machine groups found</Text>}
                                    searchPlaceholder={`Search for a ${label}...`}
                                    onOpen={fetchNextPage}
                                    onClose={() => setOpen(false)}
                                    flatListProps={{
                                        data: items,
                                        keyExtractor: (item) => `${item.value}`,
                                        onScroll: handleScroll,
                                        onEndReached: handleScroll,
                                        onEndReachedThreshold: 0.8,
                                        initialNumToRender: 10,
                                        nestedScrollEnabled: true
                                    }}
                                    selectedItemContainerStyle={{
                                        backgroundColor: "grey"
                                    }}
                                    selectedItemLabelStyle={{
                                        fontWeight: "bold"
                                    }}
                                    bottomOffset={100}
                                    dropDownDirection="AUTO"
                                />
                            </View>
                        </View>
                    </Modal>
                </Portal>

                <TouchableOpacity onPress={() => setOpen(true)} style={styles.triggerButton}>
                    <IconButton
                        style={masterdataStyles.icon}
                        icon={items.find((v) => v.value === selectedValue)?.icon || lefticon || "check-all"}
                        size={spacing.large}
                    />
                    <Text style={masterdataStyles.text}>{selectedValue ? `${items.find((v) => v.value === selectedValue)?.label}` : `Select a ${label}`}</Text>
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
});

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        width: '100%',
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