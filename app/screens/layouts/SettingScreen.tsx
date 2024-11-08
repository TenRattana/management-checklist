import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { AccessibleView, Text } from '@/components';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useRes, useTheme } from '@/app/contexts';


const SettingsScreen: React.FC = () => {
  const { darkMode, setDarkMode, theme } = useTheme();
  const { spacing, fontSize, setFontSize, } = useRes();

  const masterdataStyles = useMasterdataStyles()

  useEffect(() => {
    const loadSettings = async () => {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedFontSize = await AsyncStorage.getItem('fontSize');

      if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'darkMode');
      if (savedFontSize) setFontSize(savedFontSize);
    };

    loadSettings();
  }, []);

  const toggleSwitch = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    await AsyncStorage.setItem('darkMode', String(newDarkMode ? 'darkMode' : ''));
  };

  const handleFontSizeChange = async (size: string) => {
    setFontSize(size);
    await AsyncStorage.setItem('fontSize', size);
  };

  const MySwitch = useMemo(() => {
    return (
      <AccessibleView name="container-switch" style={{ alignSelf: 'center', alignItems: 'center' }}>
        <Switch
          onValueChange={toggleSwitch}
          value={darkMode}
          thumbColor={darkMode ? "#fff" : "#000"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          style={{ transform: [{ scale: 1.5 }] }}
        />
      </AccessibleView>
    );
  }, [toggleSwitch, darkMode]);

  const styles = StyleSheet.create({
    title: {
      textAlign: 'center',
      paddingVertical: 30,
      fontSize: spacing.large
    },
    text: {
      alignSelf: 'center'
    }
  })

  return (
    <AccessibleView name="setting" style={[masterdataStyles.container]}>
      <Text style={[masterdataStyles.textBold, masterdataStyles.text, styles.title]}>Settings</Text>

      <AccessibleView name="setting-mode" style={[masterdataStyles.settingItem]}>
        <Text style={[masterdataStyles.settingText, styles.text]}>Dark Mode</Text>
        {MySwitch}
      </AccessibleView>

      <AccessibleView name="setting-font" style={[masterdataStyles.settingItem]}>
        <Text style={[masterdataStyles.settingText, styles.text]}>Font Size</Text>
        <AccessibleView name="Picker" style={[masterdataStyles.pickerContainer]}>
          <Picker
            selectedValue={fontSize}
            style={[masterdataStyles.picker]}
            onValueChange={handleFontSizeChange}
            id='picker-font'
          >
            <Picker.Item label="Small" value="small" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Large" value="large" />
          </Picker>
        </AccessibleView>
      </AccessibleView>
    </AccessibleView>
  );
};

export default SettingsScreen;
