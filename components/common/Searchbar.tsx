import React from 'react';
import { Searchbar } from 'react-native-paper';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useTheme, useRes } from '@/app/contexts';

interface SeractBarProps {
  value: string;
  onChange: (search: string) => void;
  placeholder: string;
  testId: string;
}

const SearchBar = ({ value, onChange, placeholder, testId }: SeractBarProps) => {
  console.log("SearchBar");
  const { theme } = useTheme();
  const { spacing } = useRes()
  const masterdataStyles = useMasterdataStyles()

  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      style={masterdataStyles.searchbar}
      inputStyle={[masterdataStyles.textLight,{fontSize:spacing.medium}]}
      iconColor="#007AFF"
      placeholderTextColor={theme.colors.background}
      testID={testId}
      id={testId}
    />
  );
}
export default React.memo(SearchBar);
