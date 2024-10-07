import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropdownPicker from './Multi';

const App = () => {
  const [selectedFruits, setSelectedFruits] = useState([]);

  const handleValueChange = (value: any) => {
    setSelectedFruits(value);
  };

  return (
    <View style={styles.container}>
      <DropdownPicker onValueChange={handleValueChange} />
      {selectedFruits.length > 0 && (
        <Text style={styles.selectedText}>
          Selected Fruits: {selectedFruits.join(', ')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  selectedText: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default App;
