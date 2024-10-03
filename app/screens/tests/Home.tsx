import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function Home() {
    return (
        <View style={{ flex: 1, backgroundColor: 'seashell' }}>
            <Link to="Basic" />
            <Link to="Swipeable" />
            <Link to="Nested" />
            <Link to="Horizontal" />
        </View>
    );
}

export default Home;

function Link({ to }: { to: string }) {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate(to)}
            style={{
                padding: 14,
            }}>
            <Text style={{ color: '#555', fontSize: 24, fontWeight: 'bold' }}>
                {to}
            </Text>
        </TouchableOpacity>
    );
}
