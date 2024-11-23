import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { AccessibleView, Text } from '@/components';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import { Divider } from 'react-native-paper';

const SettingsScreen = React.memo(() => {
  const { darkMode, setDarkMode, theme } = useTheme();
  const { spacing, fontSize, setFontSize } = useRes();

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
      marginBottom: 10,
    },
    containerPicker: {
      alignSelf: 'center',
    },
    picker: {
      fontSize: spacing.small,
      color: theme.colors.onBackground,
      backgroundColor: theme.colors.background,
      borderWidth: 0,
      padding: 10,
      borderRadius: 8,
    },
    switchContainer: {
      alignSelf: 'center',
      alignItems: 'center'
    },
    userInfoRow: {
      paddingVertical: fontSize === "large" ? 10 : fontSize === "medium" ? 5 : 2,
    },
    switch: {
      transform: [{ scale: fontSize === "large" ? 1.5 : fontSize === "medium" ? 1 : 0.9 }],
    },
  });

  const MySwitch = useMemo(() => {
    return (
      <AccessibleView name="container-switch" style={styles.switchContainer}>
        <View style={styles.userInfoRow}>
          <Switch
            onValueChange={toggleSwitch}
            value={darkMode}
            thumbColor={darkMode ? '#fff' : '#000'}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            style={styles.switch}
          />
        </View>
      </AccessibleView>
    );
  }, [darkMode]);

  const PickerFont = useMemo(() => {
    return (
      <AccessibleView name="Picker" style={styles.containerPicker}>
        <View style={styles.userInfoRow}>
          <Picker
            selectedValue={fontSize}
            style={styles.picker}
            onValueChange={handleFontSizeChange}
            id="picker-font"
          >
            <Picker.Item label="Small" value="small" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Large" value="large" />
          </Picker>
        </View>
      </AccessibleView>
    );
  }, [fontSize, handleFontSizeChange]);

  return (
    <AccessibleView name="setting" style={[masterdataStyles.container]}>
      <AccessibleView name="setting-mode" style={[masterdataStyles.settingItem]}>
        <Text style={[masterdataStyles.text, { alignSelf: 'center', alignItems: 'center' }]}>Dark Mode</Text>
        {MySwitch}
      </AccessibleView>
      <Divider style={styles.divider} />

      <AccessibleView name="setting-font" style={[masterdataStyles.settingItem]}>
        <Text style={[masterdataStyles.text, { alignSelf: 'center', alignItems: 'center' }]}>Font Size</Text>
        {PickerFont}
      </AccessibleView>

      <Divider style={styles.divider} />
    </AccessibleView>
  );
});

export default SettingsScreen;
