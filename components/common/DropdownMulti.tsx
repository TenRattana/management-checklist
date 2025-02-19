import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet, Keyboard } from 'react-native';
import { HelperText, IconButton, Menu, TextInput, Modal, Portal } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import Text from '../Text';
import { DropdownMultiProps } from '@/typing/tag';

const DropdownMulti = React.memo(({ label, fetchNextPage, handleScroll, isFetching, items, open, search = true, setOpen, selectedValue, setSelectedValue, setDebouncedSearchQuery, error, searchQuery, errorMessage, lefticon, showLefticon, mode, disable }: DropdownMultiProps) => {
    const isSelected = new Set(selectedValue);
    const [searchQuerys, setSearchQuery] = useState('');
    const [menuWidth, setMenuWidth] = useState(0);
    const masterdataStyles = useMasterdataStyles();
    const { theme, darkMode } = useTheme();
    const { spacing } = useRes();
    const viewRef = useRef<View>(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const mx = hp(Platform.OS === "web" ? '40%' : '50%');

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        searchQuery !== "" && searchQuery && setSearchQuery(searchQuery)
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

    const filteredItems = items.filter(item =>
        searchQuerys === "" ? item : item.label.toLowerCase().includes(searchQuerys.toLowerCase())
    );

    const styles = StyleSheet.create({
        triggerButton: {
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomColor: 'gray',
            borderBottomWidth: 0.5,
            opacity: disable ? 0.8 : 1
        },
        searchbar: {
            backgroundColor: theme.colors.background,
            borderRadius: 4,
            flex: Platform.OS === "web" ? 1 : undefined,
            paddingHorizontal: 0,
            top: -12
        },
        emptyComponent: {
            padding: 16,
            alignItems: 'center',
        },
        menuStyle: {
            paddingTop: search ? 0 : 50,
            width: menuWidth,
        },
        dialog: {
            backgroundColor: theme.colors.background,
            borderRadius: 1,
            width: "70%",
            alignSelf: "center",
            alignContent: "center",
            marginTop: keyboardVisible ? 50 : undefined
        },
    });

    const onLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setMenuWidth(width);
    };

    const Search = useMemo(() => search && open && (
        <TextInput
            placeholder={searchQuerys || `Search ${label}`}
            value={searchQuerys ?? ""}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
            contentStyle={masterdataStyles.text}
            left={<TextInput.Icon icon="magnify" size={spacing.large} style={{ left: -6 }} />}
            right={<TextInput.Icon icon="close" size={spacing.large} onPress={() => setSearchQuery("")} style={{ right: -6 }} />}
            id="search"
            autoFocus
        />
    ), [searchQuerys, search, open]);

    const FlatData = useMemo(() =>
        <Animated.FlatList
            data={filteredItems}
            renderItem={({ item }) => {
                return (
                    <Menu.Item
                        title={item.label}
                        onPress={() => {
                            if (isSelected.has(item.value)) {
                                setSelectedValue(selectedValue.filter((val: string) => val !== item.value));
                            } else {
                                setSelectedValue([...selectedValue, item.value]);
                            }
                        }}
                        disabled={disable}
                        titleStyle={masterdataStyles.text}
                        style={{
                            paddingVertical: isSelected.has(item.value) ? 10 : 5,
                            paddingHorizontal: 15,
                            borderBottomWidth: 0.5,
                            backgroundColor: isSelected.has(item.value) ? theme.colors.drag : undefined,
                            borderBottomColor: isSelected.has(item.value) ? theme.colors.onBackground : '#d0d0d0',
                            justifyContent: 'flex-start',
                            flexDirection: 'row',
                            alignItems: 'center',
                            maxWidth: '100%'
                        }}
                    />
                )
            }}
            keyExtractor={(item) => `${item.value}`}
            style={{ maxHeight: Platform.OS === "web" ? (hp('70%') - mx) : mx, maxWidth: Platform.OS === "web" ? menuWidth : '100%', flex: Platform.OS === "web" ? 1 : undefined }}
            ListEmptyComponent={() => (
                <View style={styles.emptyComponent}>
                    <Text style={masterdataStyles.text}>No options available</Text>
                </View>
            )}
            onEndReached={handleScroll}
            onScroll={handleScroll}
            onEndReachedThreshold={0.5}
            nestedScrollEnabled
        />, [filteredItems])

    return (
        <View id="inputs" style={mode === "dialog" ? { margin: 0 } : masterdataStyles.commonContainer}>
            {Platform.OS === "web" ? (
                <Menu
                    visible={open}
                    onDismiss={() => setOpen(false)}
                    style={styles.menuStyle}
                    anchor={
                        <View onLayout={onLayout} ref={viewRef}>
                            <TouchableOpacity style={styles.triggerButton} onPress={() => setOpen(true)} disabled={disable}>
                                {open && search ? (<></>) : <>
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

                                    <Text style={[masterdataStyles.text, { flex: 1 }]}>
                                        {selectedItems
                                            ? `${selectedItems.length} ${label} selected`
                                            : `Select a ${label}`
                                        }
                                    </Text>

                                    {!showLefticon && selectedValue.length > 0 ? (
                                        <IconButton
                                            style={[masterdataStyles.icon, { right: 8, alignItems: 'flex-end' }]}
                                            icon={disable ? "lock" : "window-close"}
                                            iconColor={disable ? theme.colors.error : theme.colors.onBackground}
                                            size={spacing.large}
                                            onPress={() => {
                                                setSelectedValue([]);
                                            }}
                                        />
                                    ) : (
                                        <IconButton
                                            style={[masterdataStyles.icon, { right: 8, alignItems: 'flex-end' }]}
                                            icon="chevron-down"
                                            size={spacing.large}
                                        />
                                    )}
                                </>}
                            </TouchableOpacity>
                        </View>
                    }
                    contentStyle={{
                        maxWidth: menuWidth,
                        backgroundColor: theme.colors.background
                    }}
                >
                    {Search}
                    {FlatData}
                </Menu >
            ) : (
                <>
                    <View onLayout={onLayout} ref={viewRef}>
                        <TouchableOpacity style={styles.triggerButton} onPress={() => setOpen(true)} disabled={disable}>
                            {open && search ? (<></>) : <>
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

                                <Text style={[masterdataStyles.text, { flex: 1 }]}>
                                    {selectedItems
                                        ? `${selectedItems.length} ${label} selected`
                                        : `Select a ${label}`
                                    }
                                </Text>

                                {!showLefticon && selectedValue.length > 0 ? (
                                    <IconButton
                                        style={[masterdataStyles.icon, { right: 8, alignItems: 'flex-end' }]}
                                        icon={disable ? "lock" : "window-close"}
                                        iconColor={disable ? theme.colors.error : theme.colors.onBackground}
                                        size={spacing.large}
                                        onPress={() => {
                                            setSelectedValue([]);
                                        }}
                                    />
                                ) : (
                                    <IconButton
                                        style={[masterdataStyles.icon, { right: 8, alignItems: 'flex-end' }]}
                                        icon="chevron-down"
                                        size={spacing.large}
                                    />
                                )}
                            </>}
                        </TouchableOpacity>
                    </View>
                    {open && (
                        <Portal>
                            <Modal visible={open} onDismiss={() => setOpen(false)} contentContainerStyle={styles.dialog}>
                                {Search}
                                {FlatData}
                            </Modal>
                        </Portal>
                    )}
                </>
            )}

            <HelperText
                type="error"
                visible={error}
                style={[{ display: error ? 'flex' : 'none' }, masterdataStyles.errorText]}
            >
                {errorMessage}
            </HelperText>
        </View >
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.selectedValue === nextProps.selectedValue &&
        prevProps.items === nextProps.items &&
        prevProps.open === nextProps.open &&
        prevProps.searchQuery === nextProps.searchQuery
    );
});

export default DropdownMulti;
