import { StyleSheet, Text, Pressable } from "react-native";
import React from "react";
import { Searchbar } from "react-native-paper";
import { useRes } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import useMasterdataStyles from "@/styles/common/masterdata";
interface SearchbarProps {
    searchQuery: string;
    handleChange: (text: string) => void;
    viewProps?: React.ReactNode;
    handleBlur?: () => void;
}

const Searchbars: React.FC<SearchbarProps> = ({ searchQuery, handleChange, viewProps, handleBlur }) => {
    console.log("Searchbars");
    const masterdataStyles = useMasterdataStyles()

    const styles = StyleSheet.create({
        containerSearch: {
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginVertical: 8,
        },
        searchbar: {
            flex: 1,
            borderRadius: 8,
            marginRight: 10,
            backgroundColor: "#f0f0f0",
            elevation: 1,
        },
        clearButton: {
            backgroundColor: "#ff5722",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
        },
    });

    return (
        <AccessibleView style={styles.containerSearch}>
            {viewProps}
            <AccessibleView style={styles.row}>
                <Searchbar
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={handleChange}
                    style={styles.searchbar}
                    onBlur={handleBlur}
                    iconColor="#666"
                    placeholderTextColor="#999"
                />
                <Pressable onPress={() => handleChange("")} style={styles.clearButton}>
                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Clear</Text>
                </Pressable>
            </AccessibleView>
        </AccessibleView>
    );
};

export default Searchbars;
