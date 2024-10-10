import React, { useState } from "react";
import { Dimensions, FlatList, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { IconButton, Text } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import { AccessibleView } from "@/components";
import { CheckListType } from "@/typing/type";
import { useRes } from "@/app/contexts";

const { width, height } = Dimensions.get("window");

const DraggableItem: React.FC<{
    item: CheckListType;
    onDrop: (item: CheckListType) => void;
}> = ({ item, onDrop }) => {
    const itemTranslateX = useSharedValue(0);
    const itemTranslateY = useSharedValue(0);

    const itemAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: itemTranslateX.value },
            { translateY: itemTranslateY.value },
        ],
    }));

    const createform = useCreateformStyle();
    const { spacing } = useRes();

    const onGestureEvent = (e: PanGestureHandlerGestureEvent) => {
        itemTranslateX.value = e.nativeEvent.translationX;
        itemTranslateY.value = e.nativeEvent.translationY;
    };

    const onGestureEnd = (e: PanGestureHandlerGestureEvent) => {
        const { absoluteX, absoluteY } = e.nativeEvent;

        // ตรวจสอบว่าถูกวางในพื้นที่ขวา
        if (absoluteX > width / 2 && absoluteY > 0 && absoluteY < height) {
            runOnJS(onDrop)(item);
        }

        // รีเซ็ตตำแหน่งหลังจากลาก
        itemTranslateX.value = withSpring(0);
        itemTranslateY.value = withSpring(0);
    };

    return (
        <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
            <Animated.View style={[{ marginHorizontal: 10 }, itemAnimatedStyle]}>
                <AccessibleView name="button-tool" style={[createform.addSubFormButton]}>
                    <IconButton icon={item.Icon} size={spacing.large + 5} animated />
                    <Text style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                        {item.CTypeName}
                    </Text>
                </AccessibleView>
            </Animated.View>
        </PanGestureHandler>
    );
};

const DragTool: React.FC<{ checkListType: CheckListType[] }> = ({ checkListType }) => {
    const [generatedComponents, setGeneratedComponents] = useState<CheckListType[]>([]);
    const createformStyles = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes();

    const handleDrop = (item: CheckListType) => {
        // เพิ่มรายการที่ถูกวางลงในสถานะ
        setGeneratedComponents((prev) => [...prev, item]);
    };

    return (
        <AccessibleView name="drag-tool">
            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { textAlign: 'center', marginVertical: 10 }]}>
                Tool
            </Text>

            {checkListType.map((item, index) => (
                <DraggableItem item={item} onDrop={handleDrop} />
            ))}
        </AccessibleView>
    );
};

export default React.memo(DragTool);
