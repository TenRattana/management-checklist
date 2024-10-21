import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import {
    RenderItemParams,
    ScaleDecorator,
    ShadowDecorator,
    NestableScrollContainer,
    NestableDraggableFlatList,
} from "react-native-draggable-flatlist";
import Text from '@/components/Text'

function getColor(i: number, numItems: number = 25) {
    const multiplier = 255 / (numItems - 1);
    const colorVal = i * multiplier;
    return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
}

const mapIndexToData = (_d: any, index: number, arr: any[]) => {
    const backgroundColor = getColor(index, arr.length);
    return {
        text: `${index}`,
        key: `key-${index}`,
        backgroundColor,
        height: 75,
    };
};
type Item = ReturnType<typeof mapIndexToData>

const NUM_ITEMS = 6;
const initialData1 = [...Array(NUM_ITEMS)].fill(0).map(mapIndexToData);
const initialData2 = [...Array(NUM_ITEMS)].fill(0).map(mapIndexToData);
const initialData3 = [...Array(NUM_ITEMS)].fill(0).map(mapIndexToData);

function NestedDraggableListScreen() {
    const [data1, setData1] = useState(initialData1);
    const [data2, setData2] = useState(initialData2);
    const [data3, setData3] = useState(initialData3);

    const renderItem = useCallback((params: RenderItemParams<Item>) => {
        return (
            <ShadowDecorator>
                <ScaleDecorator activeScale={0.5}>
                    <RowItem {...params} />
                </ScaleDecorator>
            </ShadowDecorator>
        );
    }, []);

    const keyExtractor = (item: any) => item.key;

    return (
        <View style={styles.container}>
            <NestableScrollContainer>
                <Header text="List 1" />
                <NestableDraggableFlatList
                    data={data1}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    onDragEnd={({ data }) => setData1(data)}
                    activationDistance={1}

                />
                <Header text="List 2" />
                <NestableDraggableFlatList
                    data={data2}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    onDragEnd={({ data }) => setData2(data)}
                    activationDistance={1}

                />
                <Header text="List 3" />
                <NestableDraggableFlatList
                    data={data3}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    onDragEnd={({ data }) => setData3(data)}
                    activationDistance={1}

                />
            </NestableScrollContainer>
        </View>
    );
}

function Header({ text }: { text: string }) {
    return (
        <View style={{ padding: 10, backgroundColor: "seashell" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "gray" }}>
                {text}
            </Text>
        </View>
    );
}

type RowItemProps = {
    item: Item;
    drag: () => void;
};

function RowItem({ item, drag }: RowItemProps) {
    return (
        <TouchableOpacity
            activeOpacity={1}
            onLongPress={drag}
            style={[
                styles.row,
                {
                    backgroundColor: item.backgroundColor,
                    width: item.width,
                    height: item.height,
                },
            ]}
        >
            <Text style={styles.text}>{item.text}</Text>
        </TouchableOpacity>
    );
}

export default NestedDraggableListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "seashell",
        paddingTop: 44,
    },
    row: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
    },
    text: {
        fontWeight: "bold",
        color: "white",
        fontSize: 32,
    },
});