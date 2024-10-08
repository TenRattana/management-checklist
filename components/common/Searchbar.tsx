import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Searchbar, Button } from "react-native-paper";
import AccessibleView from "@/components/AccessibleView";
import useMasterdataStyles from "@/styles/common/masterdata";

const SearchWithButton: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchVisible, setSearchVisible] = useState<boolean>(false);

  const styles = StyleSheet.create({
    containerSearch: {
      padding: 16,
      backgroundColor: "#ffffff",
      borderRadius: 12,
      elevation: 3,
      marginBottom: 16,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    searchbar: {
      borderRadius: 8,
      marginRight: 10,
      height: 40,
      backgroundColor: "#f1f1f1",
    },
  });

  const handleChange = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <AccessibleView style={styles.containerSearch}>
      <Button
        mode="contained"
        onPress={() => setSearchVisible(!isSearchVisible)}
        style={{ marginBottom: 10 }}
      >
        {isSearchVisible ? "Hide Search" : "Show Search"}
      </Button>

      {isSearchVisible && (
        <View style={styles.row}>
          <Searchbar
            placeholder="Search..."
            value={searchQuery}
            onChangeText={handleChange}
            style={styles.searchbar}
            iconColor="#666"
            placeholderTextColor="#999"
          />
        </View>
      )}
    </AccessibleView>
  );
};

export default SearchWithButton;
