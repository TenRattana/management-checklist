import React, { useCallback, useState } from "react";
import { GestureEvent, HandlerStateChangeEvent, PanGestureHandler, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { IconButton, Portal } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import { CheckListType } from "@/typing/type";
import { View } from "react-native";
import { useRes, useTheme } from "@/app/contexts";
import { Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";

const DraggableItem: React.FC<{
    item: CheckListType;
    onDrop: (item: CheckListType, absoluteX: number, absoluteY: number) => void;
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
    const masterdataStyles = useMasterdataStyles()

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
    }

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
                    <View style={[{ marginHorizontal: 10, flexDirection: "row", alignItems: "center" }, createform.addSubFormButton]}>
                        <IconButton icon={item.Icon} iconColor={theme.colors.fff} size={spacing.large} style={createform.icon} animated />
                        <Text style={[masterdataStyles.textFFF, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                            {item.CTypeName}
                        </Text>
                    </View>
                </Animated.View>
                {isDragging && (
                    <Portal>
                        <Animated.View style={portalAnimatedStyle}>
                            <IconButton icon={item.Icon} iconColor={theme.colors.onBackground} size={spacing.large} style={createform.icon} animated />
                            <Text style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                                {item.CTypeName}
                            </Text>
                        </Animated.View>
                    </Portal>
                )}
            </View>
        </PanGestureHandler>
    );
});

export default DraggableItem;
