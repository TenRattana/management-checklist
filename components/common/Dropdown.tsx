import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet, StatusBar, FlatList } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { HelperText, IconButton, Text, Modal, Menu, Searchbar } from 'react-native-paper';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

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
    showLefticon,
    mode,
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
    mode?: string;
}) => {
    DropDownPicker.setListMode("FLATLIST");
    const [searchQuerys, setSearchQuery] = useState('');
    const masterdataStyles = useMasterdataStyles();
    const { theme, darkMode } = useTheme();
    const { spacing } = useRes();

    const mx = hp(Platform.OS === "web" ? '50%' : '40%');

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

    const filteredItems = items.filter(item =>
        searchQuerys === "" ? item : item.label.toLowerCase().includes(searchQuerys.toLowerCase())
    );

    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            width: "80%",
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
        searchbar: {
            backgroundColor: theme.colors.background,
            borderRadius: 4
        },
        emptyComponent: {
            padding: 16,
            alignItems: 'center',
        },
    });

    return (
        <View id="inputs" style={mode === "dialog" ? { margin: 0 } : masterdataStyles.commonContainer}>
            <View style={[Platform.OS !== 'android' ? { zIndex: 10 } : {}]}>
                <Menu
                    visible={open}
                    onDismiss={() => setOpen(false)}
                    style={{ paddingTop: 50 }}
                    anchor={<>
                        <TouchableOpacity onPress={() => setOpen(true)} style={styles.triggerButton}>
                            {!showLefticon && (
                                items.find((v) => v.value === selectedValue)?.icon ? (
                                    (items.find((v) => v.value === selectedValue)?.icon as () => JSX.Element)()
                                ) : (
                                    <IconButton
                                        style={masterdataStyles.icon}
                                        icon={lefticon || "check-all"}
                                        size={spacing.large}
                                    />
                                )
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
                    </>}
                >
                    <FlatList
                        data={filteredItems}
                        renderItem={({ item }) => (
                            <Menu.Item
                                title={item.label}
                                onPress={() => {
                                    setSelectedValue(item.value);
                                    setSearchQuery('');
                                    setOpen(false);
                                }}
                                titleStyle={masterdataStyles.text}
                            />
                        )}
                        ListHeaderComponent={() => search && (
                            <Searchbar
                                placeholder={searchQuery || `Search ${label}`}
                                value={searchQuery ?? ""}
                                onChangeText={setSearchQuery}
                                style={styles.searchbar}
                                inputStyle={masterdataStyles.text}
                                autoFocus
                            />
                        )}
                        keyExtractor={(item) => `${item.value}`}
                        style={{ maxHeight: mx }}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyComponent}>
                                <Text style={masterdataStyles.text}>No options available</Text>
                            </View>
                        )}
                        onEndReached={handleScroll}
                        onScroll={handleScroll}
                        onEndReachedThreshold={0.5}
                        nestedScrollEnabled
                    />
                </Menu>
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

export default Dropdown;
