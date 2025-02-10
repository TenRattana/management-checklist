import React from "react";
import { Searchbar } from "react-native-paper";
import { StyleSheet, View, Platform } from "react-native";
import { useTheme } from "@/app/contexts/useTheme";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts/useRes";
import { SearchBarProps } from "@/typing/tag";

const SearchBar = React.memo(({ value, onChange, placeholder, testId }: SearchBarProps) => {
  const { theme, darkMode } = useTheme();
  const { responsive } = useRes();
  const masterdataStyles = useMasterdataStyles();

  const styles = StyleSheet.create({
    searchbarWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
    },
    searchbar: {
      minWidth: 400,
      borderRadius: 10,
      height: 35,
      backgroundColor: "transparent",
      paddingVertical: 0,
    },
    searchIcon: {
      marginLeft: 5,
    },
    clearButton: {
      justifyContent: "center",
      alignItems: "center",
      marginRight: 5,
    },
  });

  return (
    <View
      style={[
        {
          marginRight: responsive === "small" ? 0 : 10,
          alignSelf: responsive === "small" ? undefined : "center",
        },
      ]}
    >
      <View
        style={[
          styles.searchbarWrapper,
          {
            marginBottom: responsive === "small" ? 5 : undefined,
            borderWidth: 1,
            borderColor: !darkMode ? "rgb(216,216,216)" : "rgb(0, 0, 20)",
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
            ...Platform.select({
              ios: {
                shadowColor: theme.colors.onBackground || "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              },
              android: {
                elevation: 6,
              },
            }),
          },
        ]}
      >
        <Searchbar
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          style={styles.searchbar}
          inputStyle={[
            masterdataStyles.text,
            {
              alignSelf: 'center',
              color: theme.colors.text,
              fontSize: 14,
              paddingHorizontal: 5,
            },
          ]}
          placeholderTextColor="#B0B0B0"
          testID={testId}
          id={testId}
          iconColor={theme.colors.onBackground}
          clearIcon="close"
          clearButtonMode="while-editing"
        />
      </View>
    </View>
  );
});

export default SearchBar
