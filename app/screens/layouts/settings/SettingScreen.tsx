import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Text } from '@/components';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import { Divider } from 'react-native-paper';
import PickerDropdown from '@/components/common/PickerDropdown';

const fontSizes = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
]

const SettingsScreen = React.memo(() => {
  const { darkMode, setDarkMode, theme } = useTheme();
  const { spacing, fontSize, setFontSize } = useRes();
  const [open, setOpen] = useState(false)
  const masterdataStyles = useMasterdataStyles();

  useEffect(() => {
    const loadSettings = async () => {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedFontSize = await AsyncStorage.getItem('fontSize');

      if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'darkMode');
      if (savedFontSize) setFontSize(savedFontSize);
    };

    loadSettings();
  }, [setDarkMode, setFontSize]);

  const toggleSwitch = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    await AsyncStorage.setItem('darkMode', newDarkMode ? 'darkMode' : '');
  };

  const handleFontSizeChange = async (size: string) => {
    setFontSize(size);
    await AsyncStorage.setItem('fontSize', size);
  };

  const styles = StyleSheet.create({
    divider: {
      backgroundColor: '#ddd',
      // marginBottom: 10,
    },
    containerPicker: {
      alignSelf: 'center',
    },
    picker: {
      // fontSize: spacing.small,
      // color: theme.colors.onBackground,
      backgroundColor: theme.colors.background,
      borderWidth: 0,
      // padding: 10,
      borderRadius: 8,
      // flex: 1
    },
    switchContainer: {
      alignSelf: 'center',
      alignItems: 'center'
    },
    userInfoRow: {
      // paddingVertical: fontSize === "large" ? 10 : fontSize === "medium" ? 5 : 2,
    },
    switch: {
      transform: [{ scale: fontSize === "large" ? 1.5 : fontSize === "medium" ? 1 : 0.9 }],
    },
  });

  return (
    <View id="setting" style={[masterdataStyles.container]}>
      <View id="setting-mode" style={[masterdataStyles.settingItem, { paddingVertical: 0 }]}>
        <Text style={[masterdataStyles.text, { alignSelf: 'center', alignItems: 'center' }]}>Dark Mode</Text>
        <View>
          <Switch
            onValueChange={toggleSwitch}
            value={darkMode}
            thumbColor={darkMode ? '#fff' : '#000'}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            style={styles.switch}
          />
        </View>
      </View>
      <Divider style={styles.divider} />

      <View id="setting-font" style={[masterdataStyles.settingItem, { paddingVertical: 2 }]}>
        <Text style={[masterdataStyles.text, { alignSelf: 'center', alignItems: 'center' }]}>Font Size</Text>
        <View>
          <PickerDropdown
            label=""
            border={false}
            handelSetFilter={(value: string) => handleFontSizeChange(value)}
            open={open}
            setOpen={(v: boolean) => setOpen(v)}
            value={fontSize}
            values={fontSizes}
            key={`picker-date`}
          />
        </View>
      </View>
      <Divider style={styles.divider} />
    </View>
  );
});

export default SettingsScreen;
