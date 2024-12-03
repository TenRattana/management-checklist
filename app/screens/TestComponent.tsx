import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';

const App = () => {
    const [data, setData] = useState([
        { id: 1, name: 'Selivanova Vera', position: 'Designer', email: 'selivanova@gmail.com', isOpen: false },
        { id: 2, name: 'Abramov Andrey', position: 'Product Manager', email: 'abramov@gmail.com', isOpen: false },
        { id: 3, name: 'Durov Dmitry', position: 'Designer', email: 'durov@gmail.com', isOpen: false },
    ]);

    const toggleRow = (id: number) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isOpen: !item.isOpen } : item
            )
        );
    };

    const renderRow = ({ item }: { item: any }) => (
        <View style={styles.row}>
            {/* Main Row */}
            <View style={styles.mainRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.position}>{item.position}</Text>
                <TouchableOpacity onPress={() => toggleRow(item.id)} style={styles.toggleButton}>
                    <Text style={styles.toggleText}>{item.isOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>
            </View>

            {/* Expanded Details */}
            {item.isOpen && (
                <View style={styles.details}>
                    <TextInput
                        style={styles.input}
                        value={item.email}
                        placeholder="Email"
                        onChangeText={(text) =>
                            setData((prev) =>
                                prev.map((row) =>
                                    row.id === item.id ? { ...row, email: text } : row
                                )
                            )
                        }
                    />
                    <TouchableOpacity style={styles.saveButton}>
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <FlatList
            data={data}
            renderItem={renderRow}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.container}
        />
    );
};

export default App;
const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    row: {
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        color: '#333',
    },
    position: {
        fontSize: 14,
        color: '#555',
        flex: 1,
    },
    toggleButton: {
        padding: 5,
    },
    toggleText: {
        fontSize: 16,
        color: '#007BFF',
    },
    details: {
        padding: 15,
    },
    input: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
