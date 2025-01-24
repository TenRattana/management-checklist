import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import RadioGroup from 'react-native-radio-buttons-group';
import Text from '../Text';
import useMasterdataStyles from '@/styles/common/masterdata';

const RadioGrid = ({ Layout, GridLable, GridRadio }: { Layout: 'row' | 'column', GridLable: number, GridRadio: number }) => {
    const masterdataStyles = useMasterdataStyles();
    const [selectedId, setSelectedId] = useState<{ [key: string]: any }>({});

    const radioButtons = useMemo(() => [
        {
            id: '1',
            label: 'ปกติ',
            value: 'option1',
            size: 20,
            labelStyle: masterdataStyles.text,
            containerStyle: { marginVertical: 10, marginHorizontal: 20 }
        },
        {
            id: '2',
            label: 'ไม่ปกติ',
            value: 'option2',
            size: 20,
            labelStyle: masterdataStyles.text,
            containerStyle: { marginVertical: 10, marginHorizontal: 20 }
        },
    ], [masterdataStyles]);

    const option = [
        { Title: '2 mm fe' },
        { Title: '2.5 mm Non fe2.5 mm Non fe2.5 mm Non fe2.5 mm Non fe2.5 mm Non fe2.5 mm Non fe2.5 mm Non fe2.5 mm Non fe' },
        { Title: '3mm S/S 316' },
    ];

    const styles = StyleSheet.create({
        optionTitle: {
            marginVertical: 10,
            fontSize: 16,
        },
        header: {
            paddingVertical: 10,
            paddingRight: 10,
        },
        labelContainer: {
            flexBasis: `${GridLable}%`
        },
        radioGroupContainer: {
            flexWrap: 'wrap',
            flexBasis: `${GridRadio}%`
        },
        radioButtonContainer: {
            marginVertical: 5,
        },
    });

    return (
        <View id="radios" style={masterdataStyles.commonContainer}>
            <FlatList
                data={option}
                renderItem={({ item, index }) => (
                    <View key={index} style={{ flexDirection: 'row' }}>
                        <View style={styles.labelContainer}>
                            <Text style={[masterdataStyles.text, styles.header]}>{item.Title}</Text>
                        </View>

                        <RadioGroup
                            radioButtons={radioButtons}
                            onPress={(selectedId) => setSelectedId((prev) => ({ ...prev, [index]: selectedId }))}
                            selectedId={selectedId[String(index)]}
                            layout={Layout || 'column'}
                            containerStyle={styles.radioGroupContainer}
                        />
                    </View>
                )}
                keyExtractor={(_, index) => `${index}`}
            />
        </View>
    );
};

export default RadioGrid;
