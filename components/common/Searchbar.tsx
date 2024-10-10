// SearchBar.tsx
import React from 'react';
import { Searchbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';

const SearchBar = ({ value, onChange, placeholder }: any) => (
  <Searchbar
    placeholder={placeholder}
    value={value}
    onChangeText={onChange}
    style={styles.searchbar}
    iconColor="#007AFF"
    placeholderTextColor="#a0a0a0"
  />
);

const styles = StyleSheet.create({
  searchbar: {
    width: 400,
    maxHeight: 60,
    marginVertical: 10,
    marginHorizontal: 30,
    borderRadius: 10,
    elevation: 4,
    fontSize: 18,
  },
});

export default React.memo(SearchBar);
