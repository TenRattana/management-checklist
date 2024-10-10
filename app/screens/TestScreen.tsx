import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Alert, LayoutRectangle } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";

interface Tool {
    id: string;
    type: string;
    label: string;
}

interface CardItem {
    id: string;
    type: string;
    label: string;
}

interface Card {
    id: string;
    type: string;
    columns: number;
    items: CardItem[];
    layout: LayoutRectangle | null; 
}

const tools: Tool[] = [
    { id: "1", type: "card", label: "Card" },
    { id: "2", type: "text", label: "Text" },
    { id: "3", type: "textinput", label: "Text Input" },
    { id: "4", type: "radio", label: "Radio" },
];

const ToolItem: React.FC<{ tool: Tool; onDrop: (tool: Tool, x: number, y: number) => void }> = ({ tool, onDrop }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }));

    const onGestureEvent = (event: any) => {
        translateX.value = event.nativeEvent.translationX;
        translateY.value = event.nativeEvent.translationY;
    };

    const onGestureEnd = (event: any) => {
        const { absoluteX, absoluteY } = event.nativeEvent;
        runOnJS(onDrop)(tool, absoluteX, absoluteY);

        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
    };

    return (
        <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
            <Animated.View style={[styles.toolItem, animatedStyle]}>
                <Text>{tool.label}</Text>
            </Animated.View>
        </PanGestureHandler>
    );
};

const CreateFormScreen: React.FC = () => {
    const [cards, setCards] = useState<Card[]>([]);
    const [nextCardId, setNextCardId] = useState(1);

    const handleDrop = (tool: Tool, x: number, y: number) => {
        if (tool.type === "card") {
            setCards((prev) => [
                ...prev,
                { id: `card-${nextCardId}`, type: "card", columns: 1, items: [], layout: null }, 
            ]);
            setNextCardId(nextCardId + 1);
        } else {
            const cardIndex = cards.findIndex((card) => {
                const layout = card.layout;
                return layout && x >= layout.x && x <= layout.x + layout.width && y >= layout.y && y <= layout.y + layout.height;
            });

            if (cardIndex >= 0) {
                addItemToCard(cards[cardIndex].id, tool);
            } else {
                Alert.alert("Error", "You must drop the item inside a card!");
            }
        }
    };

    const addItemToCard = (cardId: string, item: Tool) => {
        setCards((prev) => {
            return prev.map((card) => {
                if (card.id === cardId) {
                    const newItem: CardItem = { id: Date.now().toString(), type: item.type, label: item.label };
                    return { ...card, items: [...card.items, newItem] };
                }
                return card;
            });
        });
    };

    const onCardLayout = (cardId: string, layout: LayoutRectangle) => {
        setCards((prev) =>
            prev.map((card) =>
                card.id === cardId ? { ...card, layout } : card
            )
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftPane}>
                {tools.map((tool) => (
                    <ToolItem key={tool.id} tool={tool} onDrop={handleDrop} />
                ))}
            </View>
            <View style={styles.rightPane}>
                {cards.map((card) => (
                    <Card key={card.id} card={card} onLayout={(layout) => onCardLayout(card.id, layout)} />
                ))}
            </View>
        </View>
    );
};

const Card: React.FC<{ card: Card; onLayout: (layout: LayoutRectangle) => void }> = ({ card, onLayout }) => {
    const cardRef = useRef<View>(null);

    const handleLayout = () => {
        if (cardRef.current) {
            cardRef.current.measure((x, y, width, height, pageX, pageY) => {
                onLayout({ x: pageX, y: pageY, width, height });
            });
        }
    };

    return (
        <View ref={cardRef} style={styles.card} onLayout={handleLayout}>
            <Text style={styles.cardTitle}>Card</Text>
            <View style={styles.cardContent}>
                {card.items.map((item) => (
                    <Text key={item.id} style={styles.cardItem}>
                        {item.label}
                    </Text>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flex: 1,
    },
    leftPane: {
        width: "30%",
        backgroundColor: "#f0f0f0",
        padding: 10,
    },
    rightPane: {
        width: "70%",
        padding: 10,
        backgroundColor: "#fff",
        position: "relative",
    },
    toolItem: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: "#e0e0e0",
        borderRadius: 5,
    },
    card: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        width: "100%",
        minHeight: 100,
        position: "relative",
    },
    cardTitle: {
        fontWeight: "bold",
        marginBottom: 5,
    },
    cardContent: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    cardItem: {
        margin: 5,
        padding: 5,
        backgroundColor: "#d0d0d0",
        borderRadius: 3,
    },
});

export default CreateFormScreen;
