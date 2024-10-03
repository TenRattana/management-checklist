import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    FadeIn,
    Layout,
    PinwheelOut,
} from 'react-native-reanimated';
import SwipeableItem, {
    useSwipeableItemParams,
    OpenDirection,
} from 'react-native-swipeable-item';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';
const { multiply, sub } = Animated;
import { mapIndexToData, Item } from '../utils';

const OVERSWIPE_DIST = 20;
const NUM_ITEMS = 20;

const initialData: Item[] = [...Array(NUM_ITEMS)].fill(0).map(mapIndexToData);

function App() {
    const [data, setData] = useState(initialData);
    const itemRefs = useRef(new Map());

    const renderItem = useCallback((params: RenderItemParams<Item>) => {
        const onPressDelete = () => {
            setData((prev) => {
                return prev.filter((item) => item !== params.item);
            });
        };

        return (
            <RowItem {...params} itemRefs={itemRefs} onPressDelete={onPressDelete} />
        );
    }, []);

    return (
        <View style={styles.container}>
            <DraggableFlatList
                keyExtractor={(item) => item.key}
                data={data}
                renderItem={renderItem}
                onDragEnd={({ data }) => setData(data)}
                activationDistance={20}
            />
        </View>
    );
}

export default App;

type RowItemProps = {
    item: Item;
    drag: () => void;
    onPressDelete: () => void;
    itemRefs: React.MutableRefObject<Map<any, any>>;
};

function RowItem({ item, itemRefs, drag, onPressDelete }: RowItemProps) {
    const [snapPointsLeft, setSnapPointsLeft] = useState([150]);

    useEffect(() => {
        if (item.key === 'key-0') {
            setTimeout(() => {
                itemRefs.current
                    ?.get(item.key)
                    ?.open(OpenDirection.LEFT, undefined, { animated: true });
            }, 1000);
        }
    }, [item.key]);

    return (
        <ScaleDecorator>
            <SwipeableItem
                key={item.key}
                item={item}
                ref={(ref) => {
                    if (ref && !itemRefs.current.get(item.key)) {
                        itemRefs.current.set(item.key, ref);
                    }
                }}
                onChange={({ openDirection }) => {
                    if (openDirection !== OpenDirection.NONE) {
                        // Close all other open items
                        [...itemRefs.current.entries()].forEach(([key, ref]) => {
                            if (key !== item.key && ref) ref.close();
                        });
                    }
                }}
                overSwipe={OVERSWIPE_DIST}
                renderUnderlayLeft={() => (
                    <UnderlayLeft drag={drag} onPressDelete={onPressDelete} />
                )}
                renderUnderlayRight={() => <UnderlayRight />}
                snapPointsLeft={snapPointsLeft}>
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={drag}
                    style={[
                        styles.row,
                        { backgroundColor: item.backgroundColor, height: item.height },
                    ]}>
                    <Text style={styles.text}>{`${item.text}`}</Text>
                </TouchableOpacity>
            </SwipeableItem>
        </ScaleDecorator>
    );
}

const UnderlayLeft = ({
    drag,
    onPressDelete,
}: {
    drag: () => void;
    onPressDelete: () => void;
}) => {
    const { item, percentOpen } = useSwipeableItemParams<Item>();
    const animStyle = useAnimatedStyle(
        () => ({
            opacity: percentOpen.value,
        }),
        [percentOpen]
    );

    return (
        <Animated.View
            style={[styles.row, styles.underlayLeft, animStyle]} // Fade in on open
        >
            <TouchableOpacity onPress={onPressDelete}>
                <Text style={styles.text}>{`[delete]`}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

function UnderlayRight() {
    const { close } = useSwipeableItemParams<Item>();
    return (
        <Animated.View style={[styles.row, styles.underlayRight]}>
            <TouchableOpacity onPressOut={close}>
                <Text style={styles.text}>CLOSE</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    text: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 32,
    },
    underlayRight: {
        flex: 1,
        backgroundColor: 'teal',
        justifyContent: 'flex-start',
    },
    underlayLeft: {
        flex: 1,
        backgroundColor: 'tomato',
        justifyContent: 'flex-end',
    },
});
