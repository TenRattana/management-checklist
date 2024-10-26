import React, { useEffect } from 'react';
import { Switch, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { AccessibleView, Text } from '@/components';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useRes, useTheme } from '@/app/contexts';

const SettingsScreen: React.FC = () => {
  const { spacing, fontSize, setFontSize, } = useRes();
  const { darkMode, setDarkMode } = useTheme();

  console.log(darkMode);
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
    console.log(newDarkMode);

    setDarkMode(newDarkMode);
    await AsyncStorage.setItem('darkMode', String(newDarkMode ? 'darkMode' : ''));
  };

  const handleFontSizeChange = async (size: string) => {
    setFontSize(size);
    await AsyncStorage.setItem('fontSize', size);
  };

  return (
    <AccessibleView name="setting" style={[masterdataStyles.container]}>
      <Text style={[masterdataStyles.textBold, { textAlign: 'center', paddingVertical: 30 }]}>Settings</Text>

      <View id="setting-mode" style={[masterdataStyles.settingItem]}>
        <Text style={[masterdataStyles.settingText, { fontSize: spacing.small }]}>Dark Mode</Text>
        <Switch
          onValueChange={toggleSwitch}
          value={darkMode}
          thumbColor={darkMode ? "#00000e" : "#f4f3f4"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
      </View>

      <View id="setting-font" style={[masterdataStyles.settingItem]}>
        <Text style={[masterdataStyles.settingText, { fontSize: spacing.small }]}>Font Size</Text>
        <View id="Picker" style={[masterdataStyles.pickerContainer]}>
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
        </View>
      </View>
    </AccessibleView>
  );
};

export default SettingsScreen;
