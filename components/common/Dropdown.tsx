import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { HelperText, IconButton, Portal } from 'react-native-paper';
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
    lefticon
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
    lefticon?: string
}) => {
    const [searchQuerys, setSearchQuery] = useState('');
    const masterdataStyles = useMasterdataStyles();
    const { theme } = useTheme()
    const { spacing, responsive } = useRes()
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    useEffect(() => {
        searchQuery && setSearchQuery(searchQuery)
    }, [searchQuery])

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery && setDebouncedSearchQuery(searchQuerys);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuerys]);

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
                                    maxHeight={hp(Platform.OS === "web" ? '50%' : '70%')}
                                    open={open}
                                    value={selectedValue ? String(selectedValue) : null}
                                    items={items.filter(item =>
                                        item.label.toLowerCase().includes(searchQuerys.toLowerCase())
                                    )}
                                    containerStyle={{ flex: 1 }}
                                    setValue={() => { }}
                                    setOpen={() => setOpen(true)}
                                    placeholder={`Select for a ${label}...`}
                                    loading={isFetching}
                                    searchable={search ?? true}
                                    searchTextInputProps={{
                                        value: searchQuerys,
                                        onChangeText: handleSearch,
                                    }}
                                    renderListItem={({ item }) => (
                                        <TouchableOpacity
                                            style={{ padding: 15, backgroundColor: selectedValue.includes(item.value) ? theme.colors.drag : undefined }}
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
                                        data: items.filter(item =>
                                            item.label.toLowerCase().includes(searchQuerys.toLowerCase())
                                        ),
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
                                    dropDownDirection="BOTTOM"
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
                    <Text style={[masterdataStyles.text]}>{selectedValue ? `${items.find((v) => v.value === selectedValue)?.label}` : `Select a ${label}`}</Text>

                    {selectedValue ? (
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
