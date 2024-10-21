
import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { IconButton } from 'react-native-paper';
import Text from '@/components/Text'

const MenuSection = ({ title, isOpen, onToggle, items, navigation }: any) => {
    console.log("MenuSection");

    const itemHeight = 68;
    const height = useSharedValue(0);
    const opacity = useSharedValue(0);
    const totalHeight = items.length * itemHeight;

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
        opacity: opacity.value,
        overflow: 'hidden',
    }));

    useEffect(() => {
        console.log("isOpen");

        if (isOpen) {
            opacity.value = withTiming(1, { duration: 300 });
            height.value = withTiming(totalHeight, { duration: 300 });
        } else {
            setTimeout(() => {
                opacity.value = withTiming(0, { duration: 300 });
                height.value = withTiming(0, { duration: 300 });
            }, 300);
        }
    }, [isOpen, totalHeight, withTiming]);

    return (
        <>
            <Pressable onPress={() => onToggle()} style={styles.menuItem}>
                <Text style={styles.menuText}>{title}</Text>
                <IconButton icon={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
            </Pressable>
            <Animated.View style={[animatedStyle]}>
                {items.map((item: any) => (
                    <Pressable key={item.label} onPress={() => navigation.navigate(item.navigateTo)} style={styles.subMenuItem}>
                        <Text style={styles.subMenuText}>{item.label}</Text>
                    </Pressable>
                ))}
            </Animated.View>
        </>
    );
}

export default React.memo(MenuSection)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
    },
    menuItem: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        minHeight: 68,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
    },
    subMenuItem: {
        paddingLeft: 40,
        minHeight: 68,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subMenuText: {
        fontSize: 16,
        color: '#5e5e5e',
    },
});
