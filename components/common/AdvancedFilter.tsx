import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Button, Card, Menu, Divider, Portal, Icon, IconButton } from 'react-native-paper';
import { withTiming, useAnimatedStyle } from 'react-native-reanimated';
import HeaderDialog from '../screens/HeaderDialog';
import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import Dropdown from './Dropdown';

const filterDateOptions = [
    { label: "Select all", value: "" },
    { label: "Today", value: "Today" },
    { label: "This week", value: "This week" },
    { label: "This month", value: "This month" },
];

const AdvancedFilter = ({ handleFilter, show, toggleFilter }: any) => {
    const [visible, setVisible] = useState<{ Date: boolean, Machine: boolean, User: boolean, Status: boolean, Form: boolean, Machine_Code: boolean }>({ Date: false, Form: false, Machine: false, Machine_Code: false, Status: false, User: false });
    const { responsive, spacing } = useRes();
    const { theme } = useTheme();

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: withTiming(show ? 'auto' : 0, { duration: 300 }),
            opacity: withTiming(show ? 1 : 0, { duration: 300 }),
        };
    });

    const handleApplyFilter = () => {
        // handleFilter();
        // toggleFilter();
    };

    return !show ? (
        <View style={styles.filterContainer}>
            <TouchableOpacity onPress={toggleFilter} style={{ flexDirection: 'row' }}>
                <Icon source="filter-plus-outline" size={25} color={theme.colors.onBackground} />
                <Text style={styles.advanceFilterText}>Advance Filter</Text>
            </TouchableOpacity>
        </View>
    ) : (
        <Animated.View style={[styles.filterBox, animatedStyle]}>
            <ScrollView horizontal contentContainerStyle={styles.scrollViewContainer}>
                <Portal>
                    <Card style={[styles.filterCard, { minWidth: responsive === "small" ? "80%" : 550, backgroundColor: theme.colors.background }]}>
                        <IconButton icon="close" size={20} iconColor={theme.colors.onBackground} onPress={toggleFilter} style={{ alignSelf: 'flex-end' }} />

                        <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View>
                                <View style={styles.filterContent}>
                                    <Text style={styles.filterLabel}>Date</Text>
                                    <View style={{ flex: 1 }}>
                                        <Dropdown
                                            label={`Date`}
                                            search={false}
                                            open={visible.Date}
                                            setOpen={(v: boolean) => setVisible((prev) => ({ ...prev, Date: v }))}
                                            selectedValue={""}
                                            items={filterDateOptions}
                                            setSelectedValue={(value: string | null) => (value)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.filterContent}>
                                    <Text style={styles.filterLabel}>Machine</Text>
                                    <View style={{ flex: 1 }}>
                                        <Dropdown
                                            label={`Date`}
                                            search={false}
                                            open={visible.Machine}
                                            setOpen={(v: boolean) => setVisible((prev) => ({ ...prev, Machine: v }))}
                                            selectedValue={""}
                                            items={filterDateOptions}
                                            setSelectedValue={(value: string | null) => (value)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.filterContent}>
                                    <Text style={styles.filterLabel}>User</Text>
                                    <View style={{ flex: 1 }}>
                                        <Dropdown
                                            label={`Date`}
                                            search={false}
                                            open={visible.User}
                                            setOpen={(v: boolean) => setVisible((prev) => ({ ...prev, User: v }))}
                                            selectedValue={""}
                                            items={filterDateOptions}
                                            setSelectedValue={(value: string | null) => (value)}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={{ marginLeft: 5 }}>
                                <View style={styles.filterContent}>
                                    <Text style={styles.filterLabel}>Status</Text>
                                    <View style={{ flex: 1 }}>
                                        <Dropdown
                                            label={`Date`}
                                            search={false}
                                            open={visible.Status}
                                            setOpen={(v: boolean) => setVisible((prev) => ({ ...prev, Status: v }))}
                                            selectedValue={""}
                                            items={filterDateOptions}
                                            setSelectedValue={(value: string | null) => (value)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.filterContent}>
                                    <Text style={styles.filterLabel}>Form</Text>
                                    <View style={{ flex: 1 }}>
                                        <Dropdown
                                            label={`Date`}
                                            search={false}
                                            open={visible.Form}
                                            setOpen={(v: boolean) => setVisible((prev) => ({ ...prev, Form: v }))}
                                            selectedValue={""}
                                            items={filterDateOptions}
                                            setSelectedValue={(value: string | null) => (value)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.filterContent}>
                                    <Text style={styles.filterLabel}>Machine Code</Text>
                                    <View style={{ flex: 1 }}>
                                        <Dropdown
                                            label={`Date`}
                                            search={false}
                                            open={visible.Machine_Code}
                                            setOpen={(v: boolean) => setVisible((prev) => ({ ...prev, Machine_Code: v }))}
                                            selectedValue={""}
                                            items={filterDateOptions}
                                            setSelectedValue={(value: string | null) => (value)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Card.Content>
                        <Button mode="contained" onPress={handleApplyFilter} style={styles.applyButton}>
                            Apply Filter
                        </Button>
                    </Card>
                </Portal>
            </ScrollView>
        </Animated.View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        fontSize: 20,
        color: '#333',
    },
    containerSearch: {
        margin: 20,
    },
    contentSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    textBold: {
        fontWeight: 'bold',
    },
    filterContainer: {
        marginLeft: 20,
        paddingTop: 10,
        right: 0
    },
    advanceFilterText: {
        color: '#007BFF',
        paddingLeft: 10,
        fontSize: 16,
    },
    filterBox: {
        position: 'absolute',
        marginTop: 40,
    },
    filterCard: {
        top: 70,
        position: 'absolute',
        right: 10,
        padding: 10,
    },
    filterContent: {
        height: 62,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    applyButton: {
        marginTop: 10,
    },
    scrollViewContainer: {
        flexDirection: 'row',
        zIndex: 99,
        paddingHorizontal: 5,
    },
});

export default AdvancedFilter;
