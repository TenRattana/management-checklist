import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  Pressable
} from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

// Menu items to be dragged
const menuItems = [
  { id: "1", name: "Text", type: "text", color: "#ffcccb" },
  { id: "2", name: "TextInput", type: "textinput", color: "#add8e6" },
  { id: "3", name: "Dropdown", type: "dropdown", color: "#90ee90" },
  { id: "4", name: "Checkbox", type: "checkbox", color: "#ffe4e1" },
];

const { width } = Dimensions.get("window");

const DragAndDropForm = () => {
  const [generatedComponents, setGeneratedComponents] = useState<any[]>([]);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDropped = useSharedValue(false);

  const handleDrop = () => {
    if (draggedItem && !isDropped.value) {
      runOnJS(setGeneratedComponents)((prev) => [...prev, draggedItem]);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withSpring(translateX.value) },
        { translateY: withSpring(translateY.value) },
      ],
    };
  });

  const renderMenuItem = (item: any) => {
    const itemTranslateX = useSharedValue(0);
    const itemTranslateY = useSharedValue(0);

    const itemAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: withSpring(itemTranslateX.value) },
          { translateY: withSpring(itemTranslateY.value) },
        ],
      };
    });

    return (
      <PanGestureHandler
        key={item.id}
        onGestureEvent={(e: PanGestureHandlerGestureEvent) => {
          itemTranslateX.value = e.nativeEvent.translationX;
          itemTranslateY.value = e.nativeEvent.translationY;

          setDraggedItem(item);
        }}
        onEnded={(e: PanGestureHandlerGestureEvent) => {
          if (e.nativeEvent.absoluteX > width / 2) {
            handleDrop();
          }
          itemTranslateX.value = 0;
          itemTranslateY.value = 0;
        }}
      >
        <Animated.View
          style={[styles.menuItem, { backgroundColor: item.color }, itemAnimatedStyle]}
        >
          <Text style={styles.menuItemText}>{item.name}</Text>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const renderComponent = ({ item, drag, isActive }: { item: any; drag: () => void; isActive: boolean; }) => {
    const backgroundColor = item.color || "#fff";

    let type: React.ReactNode = null;

    switch (item.type) {
      case "text":
        type = (
          <Text key={`GeneratedText-${item.id}`} style={[styles.generatedText, { backgroundColor }]}>
            This is a Text
          </Text>
        );
        break;

      case "textinput":
        type = (
          <TextInput
            key={`GeneratedInput-${item.id}`}
            style={[styles.generatedInput, { backgroundColor }]}
            placeholder="Text Input"
          />
        );
        break;

      case "dropdown":
        type = (
          <Text key={`GeneratedDropdown-${item.id}`} style={[styles.generatedText, { backgroundColor }]}>
            Dropdown Component (replace with Picker)
          </Text>
        );
        break;

      case "checkbox":
        type = (
          <Text key={`GeneratedCheckbox-${item.id}`} style={[styles.generatedText, { backgroundColor }]}>
            Checkbox Component (replace with Checkbox)
          </Text>
        );
        break;
    }

    return (
      <ScaleDecorator>
        <Pressable
          onLongPress={drag}
          disabled={isActive}
        >
          {type}
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      {/* Left side: Menu */}
      <View style={styles.leftPane}>
        <Text style={styles.header}>Menu</Text>
        {menuItems.map((item) => renderMenuItem(item))}
      </View>

      {/* Right side: Generated components */}
      <View style={styles.rightPane}>
        <Text style={styles.header}>Generated Components</Text>

        <DraggableFlatList
          data={generatedComponents}
          renderItem={renderComponent}
          onDragEnd={({ data }) => setGeneratedComponents(data)}
          keyExtractor={(item, index) => `SF-${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          activationDistance={1}
        />
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    padding: 10,
  },
  leftPane: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  rightPane: {
    flex: 2,
    padding: 10,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  menuItem: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  menuItemText: {
    padding: 15,
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
  },
  generatedText: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  generatedInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default DragAndDropForm;