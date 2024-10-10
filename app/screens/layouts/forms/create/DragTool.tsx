import React, { useState } from "react";
import { Dimensions, FlatList } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { IconButton, Text } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import { AccessibleView } from "@/components";
import { CheckListType } from "@/typing/type";
import { useRes } from "@/app/contexts";

const { width } = Dimensions.get("window");

const DragTool: React.FC<{ checkListType: CheckListType[] }> = ({ checkListType }) => {
    const [generatedComponents, setGeneratedComponents] = useState<CheckListType[]>([]);
    const createformStyles = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes();
    console.log("DragTool");

    const handleDrop = (item: CheckListType) => {
        setGeneratedComponents((prev) => [...prev, item]);
    };

    const renderMenuItem = (item: CheckListType) => {
        const itemTranslateX = useSharedValue(0);
        const itemTranslateY = useSharedValue(0);

        const itemAnimatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: itemTranslateX.value },
                { translateY: itemTranslateY.value },
            ],
        }));

        const onGestureEvent = (e: PanGestureHandlerGestureEvent) => {
            itemTranslateX.value = e.nativeEvent.translationX;
            itemTranslateY.value = e.nativeEvent.translationY;
        };

        const onGestureEnd = (e: PanGestureHandlerGestureEvent) => {
            // Check if the item is dropped on the right half of the screen
            if (e.nativeEvent.absoluteX > width / 2) {
                runOnJS(handleDrop)(item);
            }
            // Reset position
            itemTranslateX.value = withSpring(0);
            itemTranslateY.value = withSpring(0);
        };

        return (
            <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
                <Animated.View style={[{ marginHorizontal: 10 }, itemAnimatedStyle]}>
                    <AccessibleView style={[createformStyles.fieldContainer]}>
                        <IconButton
                            icon={item.Icon ?? "camera"}
                            size={spacing.large + 5}
                        />
                        <Text style={[createformStyles.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                            {item.CTypeName}
                        </Text>
                        <IconButton icon="chevron-right" size={18} />
                    </AccessibleView>
                </Animated.View>
            </PanGestureHandler>
        );
    };

    return (
        <AccessibleView>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { textAlign: 'center', marginVertical: 10 }]}>Tool</Text>
            <FlatList
                data={checkListType}
                renderItem={({ item }) => renderMenuItem(item)}
                keyExtractor={item => item.CTypeID}
            />
        </AccessibleView>
    );
};

export default React.memo(DragTool);
