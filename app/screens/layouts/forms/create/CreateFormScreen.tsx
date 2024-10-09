import { GestureHandlerRootView } from "react-native-gesture-handler";
import Dragsubform from "./Dragsubform";
import useCreateformStyle from "@/styles/createform";
import React, { useState, useEffect } from "react";
import useForm from "@/hooks/custom/useForm";
import { AccessibleView } from "@/components";
import Preview from "@/app/screens/layouts/forms/view/Preview";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { CreateFormProps } from "@/typing/tag";
import { Text } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';

const CreateFormScreen: React.FC<CreateFormProps> = ({ route, navigation }) => {
    const {
        state,
        dispatch,
        checkList,
        groupCheckListOption,
        checkListType,
        dataType,
    } = useForm(route);

    const createform = useCreateformStyle();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const transition = useSharedValue(0);

    useEffect(() => {
        transition.value = withTiming(selectedIndex === 1 ? -1 : 1, { duration: 300 });
    }, [selectedIndex]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(transition.value, [0, 1], [1, 0]),
            transform: [{ translateX: interpolate(transition.value, [-1, 1], [0, 0]) }],
        };
    });

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <AccessibleView style={[createform.container]}>
                <AccessibleView style={createform.containerL1}>
                    <AccessibleView>
                        <SegmentedControl
                            values={["Form", "Tool"]}
                            selectedIndex={selectedIndex}
                            onChange={(event) => {
                                const newIndex = event.nativeEvent.selectedSegmentIndex;
                                setSelectedIndex(newIndex);
                            }}
                        />
                        <Animated.View style={[animatedStyle]}>
                            {selectedIndex === 1 ? (
                                <Dragsubform
                                    navigation={navigation}
                                    state={state}
                                    dispatch={dispatch}
                                    checkList={checkList}
                                    dataType={dataType}
                                    checkListType={checkListType}
                                    groupCheckListOption={groupCheckListOption}
                                />
                            ) : (
                                <AccessibleView style={{ padding: 20 }}>
                                    <Text>No fields to display</Text>
                                </AccessibleView>
                            )}
                        </Animated.View>
                    </AccessibleView>
                </AccessibleView>

                <AccessibleView style={createform.containerL2}>
                    <Preview route={route} />
                </AccessibleView>
            </AccessibleView>
        </GestureHandlerRootView>
    );
};

export default React.memo(CreateFormScreen);
