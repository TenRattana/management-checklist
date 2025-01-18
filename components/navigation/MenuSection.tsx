import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Icon, IconButton } from 'react-native-paper';
import Text from '@/components/Text';
import { useRes } from '@/app/contexts/useRes';
import useMasterdataStyles from "@/styles/common/masterdata";
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { navigate, navigationRef } from '@/app/navigations/navigationUtils';
import { ComponentNames } from '@/typing/type';
import { useTheme } from '@/app/contexts/useTheme';
import { MenuSectionProps } from '@/typing/Navigate';

const MenuSection = React.memo(({ title, isOpen, onToggle, items, navigation }: MenuSectionProps) => {
    const { fontSize, spacing } = useRes();
    const itemHeight = fontSize === "small" ? 50 : fontSize === "medium" ? 60 : 75;
    const height = useSharedValue(0);
    const opacity = useSharedValue(0);
    const totalHeight = items.length * itemHeight;
    const masterdataStyles = useMasterdataStyles();
    const { theme, darkMode } = useTheme();

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
        opacity: opacity.value,
        overflow: 'hidden',
    }), [height, opacity]);

    const setOpacity = (value: number) => {
        opacity.value = value;
    };

    useEffect(() => {
        let handler: NodeJS.Timeout | null = null

        if (isOpen) {
            setOpacity(1);
            height.value = withTiming(totalHeight, { duration: 300 });
        } else {
            handler = setTimeout(() => {
                setOpacity(0);
                height.value = withTiming(0, { duration: 300 });
            }, 300);
        }

        return () => {
            if (handler) {
                clearTimeout(handler);
            }
        };
    }, [isOpen, totalHeight]);

    const current = navigationRef.current?.getCurrentRoute();

    const styles = StyleSheet.create({
        container: {
            marginHorizontal: 20,
            marginVertical: 2,
            borderRadius: 10,
            paddingLeft: 10,
            alignItems: 'center',
            flexDirection: 'row',
            // backgroundColor: current?.name === title ? !darkMode ? 'rgba(14, 17, 224, 0.16)' : 'rgba(11, 14, 212, 0.71)' : undefined
        },
    })

    return (
        <>
            <View style={styles.container}>
                <Icon source="baby-face-outline" size={20} color={theme.colors.onBackground} />
                <View style={{ flexDirection: 'column', flex: 1 }}>
                    <TouchableOpacity onPress={onToggle} style={masterdataStyles.menuItemNav}>
                        <Text style={masterdataStyles.menuText}>{title ?? ""}</Text>
                        <IconButton icon={isOpen ? 'chevron-up' : 'chevron-down'} size={spacing.large} />
                    </TouchableOpacity>

                </View>
            </View>
            <Animated.View style={animatedStyle}>
                {items.map((item) => {
                    return (
                        <TouchableOpacity
                            key={`item-${item.label}-nav-${item.navigateTo}`}
                            onPress={() => navigate(item.navigateTo as ComponentNames)}
                            style={[masterdataStyles.subMenuItem, {
                                backgroundColor: current?.name === item.navigateTo ? !darkMode ? 'rgba(35, 39, 237, 0.16)' : 'rgba(22, 25, 226, 0.81)' : undefined
                            }]}>
                            <Icon source={item.Icon ? item.Icon : "baby-face-outline"} size={20} color={theme.colors.onBackground} />

                            <Text style={[masterdataStyles.subMenuText, { paddingLeft: 15 }]}>{item.label ?? ""}</Text>
                        </TouchableOpacity>
                    )
                })}
            </Animated.View>
        </>

    );
}, (prevProps, nextProps) => {
    return prevProps.isOpen === nextProps.isOpen && prevProps.items === nextProps.items;
});

export default MenuSection;
