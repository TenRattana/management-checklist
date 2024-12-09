import React, { useState } from "react";
import { GestureEvent, HandlerStateChangeEvent, PanGestureHandler, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { IconButton, Portal } from "react-native-paper";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import { CheckList } from "@/typing/type";

const DraggableItem: React.FC<{
    item: CheckList;
    onDrop: (item: CheckList, absoluteX: number, absoluteY: number) => void;
}> = React.memo(({ item, onDrop }) => {
    const itemTranslateX = useSharedValue(0);
    const itemTranslateY = useSharedValue(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startPosition, setStartPosition] = useState<{ x: number; y: number } | null>(null);

    const itemAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: itemTranslateX.value },
            { translateY: itemTranslateY.value },
        ],
    }));

    const portalAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: startPosition ? startPosition.x + itemTranslateX.value : 0 },
            { translateY: startPosition ? startPosition.y + itemTranslateY.value : 0 },
        ],
    }));

    const createform = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes();
    const { theme } = useTheme();

    const onGestureEvent = (e: GestureEvent<PanGestureHandlerEventPayload>) => {
        const { translationX, translationY, absoluteX, absoluteY } = e.nativeEvent;

        if (!isDragging) {
            setStartPosition({ x: absoluteX, y: absoluteY });
        }

        itemTranslateX.value = translationX;
        itemTranslateY.value = translationY;
        setIsDragging(true);
    };

    const onGestureEnd = (e: HandlerStateChangeEvent) => {
        const { absoluteX, absoluteY } = e.nativeEvent;

        if (startPosition && !isNaN(Number(absoluteX)) && !isNaN(Number(absoluteY))) {
            runOnJS(onDrop)(item, Number(absoluteX), Number(absoluteY));
        }

        itemTranslateX.value = withSpring(0);
        itemTranslateY.value = withSpring(0);
        setIsDragging(false);
        setStartPosition(null);
    };

    return (
        <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
            <View>
                <Animated.View style={[itemAnimatedStyle, { opacity: isDragging ? 0 : 1 }]}>
                    <View style={[{ flexDirection: "row", alignItems: "center" }, createform.addItem]}>
                        <IconButton
                            icon={item.Icon || "help"}
                            iconColor={theme.colors.fff}
                            size={spacing.large}
                            style={createform.icon}
                            animated
                        />
                        <Text style={[masterdataStyles.textFFF, { textAlign: "left", flex: 1 }]}>
                            {item.CTypeTitle}
                        </Text>
                    </View>
                </Animated.View>
                {isDragging && (
                    <Portal>
                        <Animated.View style={portalAnimatedStyle}>
                            <IconButton
                                icon={item.Icon || "help"}
                                iconColor={theme.colors.onBackground}
                                size={spacing.large}
                                style={createform.icon}
                                animated
                            />
                            <Text style={[createform.fieldText, { textAlign: "left", flex: 1 }]}>
                                {item.CTypeTitle}
                            </Text>
                        </Animated.View>
                    </Portal>
                )}
            </View>
        </PanGestureHandler>
    );
});

const FieldForm: React.FC<{ data: CheckList[], onDrop: (item: CheckList, absoluteX: number, absoluteY: number) => void; }> = ({ data, onDrop }) => {
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            flexWrap: 'wrap'
        },
    });

    return (
        <View style={styles.container}>
            {data?.map((item: CheckList, index: number) => (
                item && item.IsActive && (
                    <View style={{ width: '50%' }} key={index}>
                        <DraggableItem item={item} onDrop={onDrop} />
                    </View>
                )
            ))}
        </View>
    );
};

export default FieldForm;
