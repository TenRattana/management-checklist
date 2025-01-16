import { Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import React, { useState, useMemo, useEffect } from 'react';
import { IconButton, Menu, Searchbar, TextInput } from 'react-native-paper';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useRes } from '@/app/contexts/useRes';
import { FlatList } from 'react-native-gesture-handler';
import { useTheme } from '@/app/contexts/useTheme';

const PickerDropdown = React.memo(({
    open,
    setOpen,
    values,
    value,
    handelSetFilter,
    handleScroll,
    label,
    search,
    style,
    border = true
}: {
    open: boolean;
    setOpen: (v: boolean) => void;
    values: { label: string; value: any }[];
    value: any;
    handelSetFilter: (v: any) => void;
    handleScroll?: ({ nativeEvent }: any) => void;
    label: string;
    search?: boolean;
    style?: ViewStyle;
    border?: boolean
}) => {
    const maxHeight = hp(Platform.OS === 'web' ? '50%' : '40%');
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes();
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (value && search) setSearchQuery(value)
    }, [value, search])

    const styles = StyleSheet.create({
        container: {
            justifyContent: 'flex-end',
            flexDirection: 'row',
            marginRight: 10,
        },
        menuContainer: {
            paddingRight: 10,
            alignItems: 'center',
        },
        triggerButton: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomColor: border ? 'gray' : undefined,
            borderBottomWidth: border ? 0.5 : 0,
            padding: 5,
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

    const filteredValues = useMemo(() => {
        if (!searchQuery) return values;
        return values.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, values]);

    return (
        <View style={styles.container}>
            {label ? (<Text style={[masterdataStyles.text, { alignSelf: 'center', paddingRight: 15 }]}>{`${label} : `}</Text>) : false}

            <Menu
                visible={open}
                onDismiss={() => setOpen(false)}
                anchor={<>
                    <TouchableOpacity onPress={() => setOpen(true)} style={[styles.triggerButton, style]}>
                        <Text style={masterdataStyles.text}>{value || 'Select'}</Text>
                        <IconButton icon="chevron-down" size={spacing.large} />
                    </TouchableOpacity>
                </>}
                style={{ marginTop: 10 }}
            >
                <FlatList
                    data={filteredValues}
                    renderItem={({ item }) => (
                        <Menu.Item
                            title={item.label ?? ""}
                            onPress={() => {
                                handelSetFilter(item.value);
                                setSearchQuery('');
                                setOpen(false);
                            }}
                            titleStyle={masterdataStyles.text}
                        />
                    )}
                    ListHeaderComponent={() => search && (
                        <Searchbar
                            placeholder={searchQuery || `Search ${label}`}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchbar}
                            inputStyle={masterdataStyles.text}
                            autoFocus
                        />
                    )}
                    keyExtractor={(item) => `${item.value}`}
                    style={{ maxHeight }}
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
    );
});

export default PickerDropdown;
