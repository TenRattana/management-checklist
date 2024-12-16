import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const PaginationControls = ({ currentPage, pageSize, filteredData, handlePageChange }: any) => {
    return (
        <View style={styles.paginationContainer}>
            <TouchableOpacity
                style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                disabled={currentPage === 1}
                onPress={() => handlePageChange(currentPage - 1)}>
                <Text style={styles.buttonText}>Prev</Text>
            </TouchableOpacity>

            <Text style={styles.pageNumber}>{currentPage}</Text>

            <TouchableOpacity
                style={[styles.paginationButton, currentPage * pageSize >= filteredData.length && styles.disabledButton]}
                disabled={currentPage * pageSize >= filteredData.length}
                onPress={() => handlePageChange(currentPage + 1)}>
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    paginationButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
        opacity: 1, 
    },
    disabledButton: {
        backgroundColor: '#A0A0A0',
        opacity: 0.5, 
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    pageNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
});

export default PaginationControls;
