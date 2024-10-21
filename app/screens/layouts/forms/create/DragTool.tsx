import React, { useState, useRef } from "react";
import { Dimensions, FlatList, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent, ScrollView } from "react-native-gesture-handler";
import { IconButton } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import { AccessibleView ,Text } from "@/components";
import { CheckListType } from "@/typing/type";
import { useRes } from "@/app/contexts";
import { useDispatch, useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");

const DraggableItem: React.FC<{
    item: CheckListType;
    onDrop: (item: CheckListType, x: number, y: number) => void;
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

    const onGestureEvent = (e: any) => {
        itemTranslateX.value = e.nativeEvent.translationX;
        itemTranslateY.value = e.nativeEvent.translationY;
    };

    const onGestureEnd = (e: any) => {
        const { absoluteX, absoluteY } = e.nativeEvent;

        runOnJS(onDrop)(item, absoluteX, absoluteY);

        itemTranslateX.value = withSpring(0);
        itemTranslateY.value = withSpring(0);
    };

    return (
        <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
            <Animated.View style={[{ marginHorizontal: 10 }, itemAnimatedStyle, createform.addSubFormButton]}>
                <IconButton icon={item.Icon} size={spacing.large + 5} animated />
                <Text style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                    {item.CTypeName}
                </Text>
            </Animated.View>
        </PanGestureHandler>
    );
};

const DragTool: React.FC<{ checkListType: CheckListType[], handleDrop: any }> = ({ checkListType, handleDrop }) => {
    const [generatedComponents, setGeneratedComponents] = useState<CheckListType[]>([]);
    const createformStyles = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes();


    return (
        <AccessibleView name="drag-tool" style={{ padding: 20 }}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { textAlign: 'center', marginVertical: 10 }]}>
                Tool
            </Text>

            {checkListType.map((item, index) => (
                <DraggableItem item={item} onDrop={handleDrop} key={`${item.CTypeID}-${index}`} />
            ))}
        </AccessibleView>
    );
};

export default React.memo(DragTool);
