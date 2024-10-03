import React, { useCallback, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import DraggableFlatList, {
    ScaleDecorator,
    RenderItemParams,
} from "react-native-draggable-flatlist";
import { mapIndexToData, Item } from "../utils"

const NUM_ITEMS = 10;

const initialData: Item[] = [...Array(NUM_ITEMS)].map(mapIndexToData);



export default function Horizontal() {
    const [data, setData] = useState(initialData);

    const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Item>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        styles.rowItem,
                        {
                            opacity: isActive ? 0.5 : 1,
                            padding: 5,
                            backgroundColor: item.backgroundColor,
                        },
                    ]}
                >
                    <Text style={styles.text}>{item.text}</Text>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <DraggableFlatList
                horizontal

                data={data}
                onDragEnd={({ data }) => setData(data)}
                keyExtractor={(item) => {
                    return item.key
                }}
                renderItem={renderItem}
                renderPlaceholder={() => <View style={{ flex: 1, backgroundColor: 'tomato' }} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    rowItem: {
        height: 100,
        width: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
});