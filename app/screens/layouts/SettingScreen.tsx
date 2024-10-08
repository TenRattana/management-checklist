import React, { useEffect, useState } from 'react';
import { Text, Switch, StyleSheet, Pressable, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { AccessibleView } from '@/components';

const SettingsScreen: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<string>('medium');
  const [language, setLanguage] = useState<string>('en');
  console.log("SettingsScreen");

  useEffect(() => {
    const loadSettings = async () => {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      const savedLanguage = await AsyncStorage.getItem('language');

      if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
      if (savedFontSize) setFontSize(savedFontSize);
      if (savedLanguage) setLanguage(savedLanguage);
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

  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    await AsyncStorage.setItem('language', lang);
  };

  return (
    <AccessibleView name="setting" style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      <Text style={[styles.title, { fontSize: fontSize === 'large' ? 24 : fontSize === 'medium' ? 18 : 14 }]}>Settings</Text>

      <AccessibleView name="setting-mode" style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch
          onValueChange={toggleSwitch}
          value={darkMode}
        />
      </AccessibleView>

      <AccessibleView name="setting-font" style={styles.settingItem}>
        <Text style={styles.settingText}>Font Size</Text>
        <Picker
          selectedValue={fontSize}
          style={styles.picker}
          onValueChange={handleFontSizeChange}
        >
          <Picker.Item label="Small" value="small" />
          <Picker.Item label="Medium" value="medium" />
          <Picker.Item label="Large" value="large" />
        </Picker>
      </AccessibleView>
    </AccessibleView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 18,
    color: '#000',
  },
  picker: {
    height: 50,
    width: 150,
  },
});

export default SettingsScreen;
