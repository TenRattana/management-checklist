// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   Dimensions,
//   Pressable,
// } from "react-native";
// import { PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
// import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   FadeInRight,
//   FadeInLeft,
//   FadeOutRight,
//   FadeOutLeft,
// } from "react-native-reanimated";

// const menuItems = [
//   { id: "1", name: "Text", type: "text", color: "#ffcccb" },
//   { id: "2", name: "TextInput", type: "textinput", color: "#add8e6" },
//   { id: "3", name: "Dropdown", type: "dropdown", color: "#90ee90" },
//   { id: "4", name: "Checkbox", type: "checkbox", color: "#ffe4e1" },
// ];

// const { width } = Dimensions.get("window");

// const DragAndDropForm = () => {
//   const [generatedComponents, setGeneratedComponents] = useState<any[]>([]);
//   const [draggedItem, setDraggedItem] = useState<any>(null);
//   const [selectedMenu, setSelectedMenu] = useState<"all" | "recent">("all");
//   const [recentMenuItems, setRecentMenuItems] = useState<any[]>([]);
//   const [itemsToRender, setItemsToRender] = useState<any[]>(menuItems);

//   const handleDrop = () => {
//     if (draggedItem) {
//       setGeneratedComponents((prev) => [...prev, draggedItem]);
//       setRecentMenuItems((prev) => {
//         if (!prev.some((item) => item.id === draggedItem.id)) {
//           return [...prev, draggedItem];
//         }
//         return prev;
//       });
//       setDraggedItem(null);
//     }
//   };

//   const switchMenu = (menu: "all" | "recent") => {
//     setSelectedMenu(menu);
//     setItemsToRender(menu === "all" ? menuItems : recentMenuItems);
//   };

//   const renderMenuItem = () => {
//     if (itemsToRender.length === 0) {
//       return <Text>No items to display</Text>;
//     }

//     return itemsToRender.map((item) => {
//       const itemTranslateX = useSharedValue(0);
//       const itemTranslateY = useSharedValue(0);

//       const itemAnimatedStyle = useAnimatedStyle(() => ({
//         transform: [
//           { translateX: itemTranslateX.value },
//           { translateY: itemTranslateY.value },
//         ],
//       }));

//       return (
//         <PanGestureHandler
//           key={item.id}
//           onGestureEvent={(e: PanGestureHandlerGestureEvent) => {
//             itemTranslateX.value = e.nativeEvent.translationX;
//             itemTranslateY.value = e.nativeEvent.translationY;
//             setDraggedItem(item);
//           }}
//           onEnded={(e: PanGestureHandlerGestureEvent) => {
//             if (e.nativeEvent.absoluteX > width / 2) {
//               handleDrop();
//             }
//             itemTranslateX.value = 0;
//             itemTranslateY.value = 0;
//           }}
//         >
//           <Animated.View
//             style={[styles.menuItem, { backgroundColor: item.color }, itemAnimatedStyle]}
//           >
//             <Text style={styles.menuItemText}>{item.name}</Text>
//           </Animated.View>
//         </PanGestureHandler>
//       );
//     });
//   };

//   const renderComponent = ({ item, drag, isActive }: { item: any; drag: () => void; isActive: boolean; }) => {
//     const backgroundColor = item.color || "#fff";

//     let Component;
//     switch (item.type) {
//       case "text":
//         Component = (
//           <Text style={[styles.generatedText, { backgroundColor }]}>
//             This is a Text
//           </Text>
//         );
//         break;
//       case "textinput":
//         Component = (
//           <TextInput
//             style={[styles.generatedInput, { backgroundColor }]}
//             placeholder="Text Input"
//           />
//         );
//         break;
//       case "dropdown":
//         Component = (
//           <Text style={[styles.generatedText, { backgroundColor }]}>
//             Dropdown Component (replace with Picker)
//           </Text>
//         );
//         break;
//       case "checkbox":
//         Component = (
//           <Text style={[styles.generatedText, { backgroundColor }]}>
//             Checkbox Component (replace with Checkbox)
//           </Text>
//         );
//         break;
//       default:
//         Component = null;
//     }

//     return (
//       <ScaleDecorator>
//         <Pressable onLongPress={drag} disabled={isActive}>
//           {Component}
//         </Pressable>
//       </ScaleDecorator>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.leftPane}>
//         <Text style={styles.header}>Menu</Text>

//         <View style={styles.menuSwitcher}>
//           <Pressable onPress={() => switchMenu("all")}>
//             <Text style={styles.switchText}>All Tools</Text>
//           </Pressable>
//           <Pressable onPress={() => switchMenu("recent")}>
//             <Text style={styles.switchText}>Recent</Text>
//           </Pressable>
//         </View>

//         <Animated.View entering={selectedMenu === "all" ? FadeInRight : FadeInLeft} exiting={selectedMenu === "all" ? FadeOutLeft : FadeOutRight}>
//           {renderMenuItem()}
//         </Animated.View>
//       </View>

//       <View style={styles.rightPane}>
//         <Text style={styles.header}>Generated Components</Text>

//         <DraggableFlatList
//           data={generatedComponents}
//           renderItem={renderComponent}
//           onDragEnd={({ data }) => setGeneratedComponents(data)}
//           keyExtractor={(item) => item.id}
//           showsVerticalScrollIndicator={false}
//           activationDistance={1}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     flex: 1,
//     padding: 10,
//   },
//   leftPane: {
//     flex: 1,
//     padding: 10,
//     borderRightWidth: 1,
//     borderColor: "#ddd",
//     backgroundColor: "#f9f9f9",
//   },
//   rightPane: {
//     flex: 2,
//     padding: 10,
//   },
//   header: {
//     fontSize: 18,
//     marginBottom: 10,
//     fontWeight: "bold",
//   },
//   menuItem: {
//     marginBottom: 10,
//     borderRadius: 8,
//     overflow: "hidden",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1,
//   },
//   menuItemText: {
//     padding: 15,
//     textAlign: "center",
//     color: "#333",
//     fontWeight: "500",
//   },
//   generatedText: {
//     padding: 15,
//     marginBottom: 10,
//     borderRadius: 5,
//   },
//   generatedInput: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//   },
//   menuSwitcher: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 15,
//   },
//   switchText: {
//     fontSize: 16,
//     color: "#007AFF",
//   },
// });

// export default DragAndDropForm;

import * as React from 'react';
import { DataTable, IconButton, Button } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

const MyComponent = () => (
  <View style={{ paddingVertical: 5, padding: 30 }}>
    <View style={{ marginVertical: 30, borderRadius: 10, borderWidth: 0.2, paddingTop: 20 }}>
      <Button mode="contained" onPress={() => console.log('Pressed')} style={{ borderRadius: 5, marginVertical: 20, marginLeft: 20, width: 200 }}>
        Create Machine
      </Button>
      <DataTable style={{ padding: 20 }}>
        <DataTable.Header>
          <DataTable.Title>Dessert</DataTable.Title>
          <DataTable.Title numeric>Calories</DataTable.Title>
          <DataTable.Title numeric>Fat</DataTable.Title>
          <DataTable.Title numeric>Fat</DataTable.Title>
          <DataTable.Title numeric>Fat</DataTable.Title>
          <DataTable.Title numeric>Fat</DataTable.Title>
          <DataTable.Title numeric>Fat</DataTable.Title>
          <DataTable.Title style={styles.eventColumn}>Event</DataTable.Title>
        </DataTable.Header>

        <DataTable.Row>
          <DataTable.Cell>Frozen yogurt</DataTable.Cell>
          <DataTable.Cell numeric>159</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell style={styles.eventCell}>
            <IconButton icon="pencil-box" />
            <IconButton icon="trash-can" />
          </DataTable.Cell>
        </DataTable.Row>

        <DataTable.Row>
          <DataTable.Cell>Ice cream sandwich</DataTable.Cell>
          <DataTable.Cell numeric>237</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>8.0</DataTable.Cell>
          <DataTable.Cell style={styles.eventCell}>
            <IconButton icon="pencil-box" />
            <IconButton icon="trash-can" />
          </DataTable.Cell>
        </DataTable.Row>

        <DataTable.Row>
          <DataTable.Cell>Ice cream sandwich</DataTable.Cell>
          <DataTable.Cell numeric>237</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>6.0</DataTable.Cell>
          <DataTable.Cell numeric>8.0</DataTable.Cell>
          <DataTable.Cell style={styles.eventCell}>
            <IconButton icon="pencil-box" />
            <IconButton icon="trash-can" />
          </DataTable.Cell>
        </DataTable.Row>

        <DataTable.Pagination
          page={1}
          numberOfPages={3}
          onPageChange={page => {
            console.log(page);
          }}
          label="1-2 of 6"
        />
      </DataTable>
    </View>

  </View >

);

const styles = StyleSheet.create({
  eventColumn: {
    width: 100,
    justifyContent: 'flex-end',
  },
  eventCell: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
});

export default MyComponent;