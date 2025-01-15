import React from "react";
import { Searchbar } from "react-native-paper";
import { StyleSheet, View, Platform } from "react-native";
import { useTheme } from "@/app/contexts/useTheme";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts/useRes";

interface SearchBarProps {
  value: string;
  onChange: (search: string) => void;
  placeholder: string;
  testId: string;
}

const SearchBar = ({ value, onChange, placeholder, testId }: SearchBarProps) => {
  const { theme } = useTheme();
  const { responsive } = useRes();
  const masterdataStyles = useMasterdataStyles();

  return (
    <View
      style={[
        { flex: responsive === "small" ? undefined : 1, marginRight: responsive === "small" ? 0 : 10, alignSelf: responsive === "small" ? undefined : "center" },
      ]}
    >
      <View
        style={[
          styles.searchbarWrapper,
          {
            borderWidth: 1,
            backgroundColor: theme.colors.surface,
            ...Platform.select({
              ios: {
                shadowColor: theme.colors.onBackground || "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
              },
              android: {
                elevation: 4,
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
            { color: theme.colors.text },
          ]}
          placeholderTextColor="#B0B0B0"
          testID={testId}
          id={testId}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchbarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 5
  },
  searchbar: {
    flex: 1,
    elevation: 0,
    backgroundColor: "transparent",
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

export default React.memo(SearchBar);
