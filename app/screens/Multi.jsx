import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const DropdownPicker = ({ onValueChange }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([]);
  const [items, setItems] = useState([
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date' },
    { label: 'Elderberry', value: 'elderberry' },
  ]);

  const handleSelect = (value) => {
    setValue(value);
    onValueChange(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select fruits:</Text>
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={handleSelect}
          setItems={setItems}
          multiple={true}
          placeholder="Choose fruits"
          multipleText="%d fruits have been selected."
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainerStyle}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.placeholderText}
        />
        <Button title="Done" onPress={() => onValueChange(value)}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    width:'95%',
  },
  dropdown: {
    flex: 0.8, 
    borderColor: 'transparent', 
    borderBottomWidth: 1, 
    borderBottomColor: '#6200ee',
    height: 50,
    marginRight: 10, // เพิ่มระยะห่างระหว่าง dropdown และปุ่ม
  },
  dropdownContainerStyle: {
    borderColor: 'transparent', // ไม่มีกรอบรอบ
    borderBottomWidth: 1,
    borderBottomColor: '#6200ee',
  },
  dropdownText: {
    fontSize: 18, // ขนาดตัวอักษรที่ใหญ่ขึ้น
    color: '#000',
  },
  placeholderText: {
    fontSize: 18, // ขนาดตัวอักษรของ placeholder
    color: '#999',
  },
});

export default DropdownPicker;
