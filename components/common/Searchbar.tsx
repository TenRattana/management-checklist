import React from 'react';
import { Searchbar } from 'react-native-paper';
import useMasterdataStyles from '@/styles/common/masterdata';

interface SeractBarProps {
  value: string;
  onChange: (search: string) => void;
  placeholder: string;
  testId: string;
}

const SearchBar = ({ value, onChange, placeholder, testId }: SeractBarProps) => {
  console.log("SearchBar");
  const masterdataStyles = useMasterdataStyles()
  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      style={masterdataStyles.searchbar}
      inputStyle={masterdataStyles.text}
      iconColor="#007AFF"
      placeholderTextColor="#a0a0a0"
      testID={testId}
    />
  );
}
export default React.memo(SearchBar);
