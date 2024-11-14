import useMasterdataStyles from '@/styles/common/masterdata';
import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    View,
    useWindowDimensions,
} from 'react-native';
import Text from '../Text';
import Animated, {
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

type SegmentedControlProps = {
    options: string[];
    selectedOption: string;
    onOptionPress?: (option: string) => void;
};

const SegmentedControl: React.FC<SegmentedControlProps> = React.memo(
    ({ options, selectedOption, onOptionPress }) => {
        const { width: windowWidth } = useWindowDimensions();

        const masterdataStyles = useMasterdataStyles();
        const internalPadding = 20;

        const itemWidth = `calc(100% / ${options.length})`;

        const rStyle = useAnimatedStyle(() => {
            return {
                left: withTiming(
                    (windowWidth - internalPadding) / options.length * options.indexOf(selectedOption) + internalPadding / 2,
                    { duration: 300 }
                ),
            };
        }, [selectedOption, options, itemWidth]);

        return (
            <View
                style={[styles.container, { paddingLeft: internalPadding / 2 }]}
            >
                <Animated.View
                    style={[rStyle, styles.activeBox]}
                />

                {options.map((option) => {
                    const isSelected = option === selectedOption;
                    return (
                        <TouchableOpacity
                            onPress={() => onOptionPress?.(option)}
                            key={option}
                            style={[styles.optionContainer, {
                                flex: 1,
                                backgroundColor: isSelected ? '#4A90E2' : 'transparent',
                                borderRadius: 10,
                                marginHorizontal: 5,
                            }]}
                        >
                            <Text
                                style={[
                                    masterdataStyles.text,
                                    {
                                        color: isSelected ? '#fff' : '#333',
                                        fontWeight: isSelected ? 'bold' : 'normal',
                                    },
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
        height: 60,
        marginBottom: 15
    },
    activeBox: {
        position: 'absolute',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    optionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        paddingVertical: 5,
        backgroundColor: 'transparent',
        borderRadius: 10,
    },
});

export default SegmentedControl;
