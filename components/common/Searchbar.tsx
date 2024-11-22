import React from 'react';
import { Searchbar } from 'react-native-paper';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useTheme } from '@/app/contexts/useTheme';
import { useRes } from '@/app/contexts/useRes';

interface SeractBarProps {
  value: string;
  onChange: (search: string) => void;
  placeholder: string;
  testId: string;
}

const SearchBar = ({ value, onChange, placeholder, testId }: SeractBarProps) => {
  const { theme } = useTheme();
  const { spacing } = useRes()
  const masterdataStyles = useMasterdataStyles()

  const isThai = (text: string): boolean => {
    const thaiCharRange = /[\u0E00-\u0E7F]/;
    return thaiCharRange.test(text);
  };

  const fontFamily = isThai(value) ? 'Sarabun' : 'Poppins';

  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      style={masterdataStyles.searchbar}
      inputStyle={[masterdataStyles.textLight, { fontSize: spacing.small, fontWeight: '400', fontFamily }]}
      iconColor="#007AFF"
      placeholderTextColor={theme.colors.background}
      testID={testId}
      id={testId}
    />
  );
}
export default React.memo(SearchBar);
