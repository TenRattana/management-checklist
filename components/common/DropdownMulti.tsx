import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { HelperText, IconButton, Portal } from 'react-native-paper';
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

const DropdownMulti = React.memo(({
    label,
    fetchNextPage,
    handleScroll,
    isFetching,
    items,
    open,
    search,
    setOpen,
    selectedValue,
    searchQuery,
    setSelectedValue,
    setDebouncedSearchQuery,
    error,
    errorMessage,
    lefticon
}: {
    search?: boolean;
    label: string;
    open: boolean;
    setOpen: (v: boolean) => void;
    selectedValue: any;
    searchQuery?: string;
    items: { label: string; value: string, icon?: () => JSX.Element }[];
    setSelectedValue: (value: string | string[] | null) => void;
    isFetching?: boolean;
    fetchNextPage?: () => void;
    handleScroll?: ({ nativeEvent }: any) => void;
    setDebouncedSearchQuery?: (value: string) => void;
    error?: boolean;
    errorMessage?: string;
    lefticon?: string
}) => {
    const [searchQuerys, setSearchQuery] = useState('');
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes();
    const { theme, darkMode } = useTheme()

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    useEffect(() => {
        searchQuery && setSearchQuery(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery && setDebouncedSearchQuery(searchQuerys);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuerys]);

    const selectedItems = items.filter(item => selectedValue.includes(item.value));

    const safeHandleScroll = (event: any) => {
        const { nativeEvent } = event;
        if (nativeEvent && nativeEvent?.contentSize) {
            handleScroll && handleScroll(event);
        }
    };

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
                                    multiple={true}
                                    maxHeight={hp(Platform.OS === "web" ? '50%' : '70&')}
                                    open={open}
                                    value={selectedValue}
                                    items={items.filter(item =>
                                        item.label.toLowerCase().includes(searchQuerys.toLowerCase())
                                    )}
                                    theme={darkMode ? 'DARK' : 'LIGHT'}
                                    containerStyle={{ flex: 1 }}
                                    setValue={() => { }}
                                    setOpen={() => setOpen(true)}
                                    placeholder={`Select for a ${label}...`}
                                    loading={isFetching}
                                    searchable={search ?? true}
                                    searchTextInputStyle={masterdataStyles.text}
                                    searchTextInputProps={{
                                        value: searchQuerys,
                                        onChangeText: handleSearch,
                                    }}
                                    renderListItem={({ item }) => (
                                        <TouchableOpacity
                                            style={{ padding: 15, backgroundColor: selectedValue.includes(item.value) ? theme.colors.drag : undefined }}
                                            onPress={() => {
                                                if (selectedValue.includes(item.value)) {
                                                    setSelectedValue(selectedValue.filter((val: string) => val !== item.value));
                                                } else {
                                                    setSelectedValue([...selectedValue, item.value]);
                                                }
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
                                        data: items.filter(item =>
                                            item.label.toLowerCase().includes(searchQuerys.toLowerCase())
                                        ),
                                        keyExtractor: (item) => `${item.value}`,
                                        onScroll: safeHandleScroll,
                                        onEndReached: safeHandleScroll,
                                        onEndReachedThreshold: 0.8,
                                        initialNumToRender: 10,
                                        nestedScrollEnabled: true
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
                        icon={lefticon || "check-all"}
                        size={spacing.large}
                    />
                    <Text style={[masterdataStyles.text]}>
                        {selectedItems.length > 0
                            ? `${selectedItems.length} ${label}(s) selected: ${selectedItems.map(item => item.label).join(', ')}`
                            : `Select a ${label}`
                        }
                    </Text>

                    {selectedValue.length > 0 ? (
                        <IconButton
                            style={[masterdataStyles.icon, { right: 8, flex: 1, alignItems: 'flex-end' }]}
                            icon="window-close"
                            size={spacing.large}
                            onPress={() => setSelectedValue([])}
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

export default DropdownMulti;
