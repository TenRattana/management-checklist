import React, { useEffect, useState } from 'react';
import { Text, Switch, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { AccessibleView } from '@/components';
import { useRes } from '@/app/contexts';

const SettingsScreen: React.FC = () => {
  console.log("SettingsScreen");
  const { darkMode ,spacing, fontSize, setFontSize , setDarkMode} = useRes();

  useEffect(() => {
    const loadSettings = async () => {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedFontSize = await AsyncStorage.getItem('fontSize');

      if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
      if (savedFontSize) setFontSize(savedFontSize);
    };

    loadSettings();
  }, []);

  const toggleSwitch = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    await AsyncStorage.setItem('darkMode', String(newDarkMode));
  };

  const handleFontSizeChange = async (size: string) => {
    setFontSize(size);
    await AsyncStorage.setItem('fontSize', size);
  };

  return (
    <AccessibleView name="setting" style={[styles.container]}>
      <Text style={[styles.title]}>Settings</Text>

      <AccessibleView name="setting-mode" style={[styles.settingItem]}>
        <Text style={[styles.settingText, { fontSize: spacing.small}]}>Dark Mode</Text>
        <Switch
          onValueChange={toggleSwitch}
          value={darkMode}
          thumbColor={darkMode ? "#00000e" : "#f4f3f4"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
      </AccessibleView>

      <AccessibleView name="setting-font" style={[styles.settingItem]}>
        <Text style={[styles.settingText, { fontSize: spacing.small } ]}>Font Size</Text>
        <AccessibleView name="Picker" style={[styles.pickerContainer]}>
          <Picker
            selectedValue={fontSize}
            style={[styles.picker]}
            onValueChange={handleFontSizeChange}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  settingText: {
    fontWeight: '500',
  },
  pickerContainer: {
    width: 150,
    borderWidth: 1,
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default SettingsScreen;
