import { StyleSheet, Text, View, Pressable } from "react-native";
import React from "react";
import { Searchbar } from "react-native-paper";

interface SearchbarProps {
    searchQuery: string;
    handleChange: (text: string) => void;
    viewProps?: React.ReactNode;
    handleBlur?: () => void;
}

const Searchbars: React.FC<SearchbarProps> = ({ searchQuery, handleChange, viewProps, handleBlur }) => {
    console.log("Searchbars");

    return (
        <View style={styles.containerSearch}>
            <View style={styles.row}>
                {viewProps}
                <Searchbar
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={handleChange}
                    style={styles.searchbar}
                />

                <Pressable onPress={() => handleChange("")} style={styles.clearButton}>
                    <Text style={styles.buttonText}>Clear</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default Searchbars;

const styles = StyleSheet.create({
    containerSearch: {
        padding: 16,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginHorizontal: "2%",
        marginBottom: "1%",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    searchbar: {
        flex: 1,
        borderRadius: 5,
        marginHorizontal: 8,
    },
    clearButton: {
        backgroundColor: "#ff5722",
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        minWidth: 100,
        textAlign: "center",
        fontWeight: "bold",
    },
});
