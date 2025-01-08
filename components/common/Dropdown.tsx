import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet, FlatList } from 'react-native';
import { HelperText, IconButton, Text, Menu, Searchbar, TextInput } from 'react-native-paper';
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
    const [searchQuerys, setSearchQuery] = useState('');
    const [menuWidth, setMenuWidth] = useState(0);
    const masterdataStyles = useMasterdataStyles();
    const { theme, darkMode } = useTheme();
    const { spacing } = useRes();

    const mx = hp(Platform.OS === "web" ? '40%' : '40%');

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
        triggerButton: {
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomColor: 'gray',
            borderBottomWidth: 0.5,
        },
        searchbar: {
            backgroundColor: theme.colors.background,
            borderRadius: 4,
            flex: 1,
            bottom: 4,
        },
        emptyComponent: {
            padding: 16,
            alignItems: 'center',
        },
        menuStyle: {
            paddingTop: 50,
            width: menuWidth,
        },
    });

    const onLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setMenuWidth(width);
    };

    return (
        <View id="inputs" style={mode === "dialog" ? { margin: 0 } : masterdataStyles.commonContainer}>
            <Menu
                visible={open}
                onDismiss={() => setOpen(false)}
                style={styles.menuStyle}
                anchor={
                    <View onLayout={onLayout}>
                        {search && open ? (
                            <TextInput
                                placeholder={searchQuerys || `Search ${label}`}
                                value={searchQuerys ?? ""}
                                onChangeText={setSearchQuery}
                                style={styles.searchbar}
                                contentStyle={masterdataStyles.text}
                                left={<TextInput.Icon icon="magnify" size={spacing.large}
                                    style={{
                                        left: -6
                                    }}
                                />}
                                id='search'
                                autoFocus
                            />
                        ) : <TouchableOpacity style={styles.triggerButton} onPress={() => setOpen(true)}>
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

                            <Text style={[masterdataStyles.text, { flex: 1 }]}>{selectedValue ? `${items.find((v) => v.value === selectedValue)?.label}` : `Select a ${label}`}</Text>

                            {!showLefticon && selectedValue ? (
                                <IconButton
                                    style={[masterdataStyles.icon, { right: 8, alignItems: 'flex-end' }]}
                                    icon="window-close"
                                    size={spacing.large}
                                    onPress={() => {
                                        setSelectedValue("");
                                    }}
                                />
                            ) : (
                                <IconButton style={[masterdataStyles.icon, { right: 8, alignItems: 'flex-end' }]} icon="chevron-down" size={spacing.large} />
                            )}
                        </TouchableOpacity>
                        }
                    </View>
                }
                contentStyle={{
                    maxWidth: menuWidth,
                    backgroundColor: theme.colors.background
                }}
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
                            style={{ paddingHorizontal: 10 }}
                        />
                    )}
                    contentContainerStyle={{ flex: 1 }}
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
