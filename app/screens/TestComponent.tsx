import { Pressable, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { NestableDraggableFlatList, NestableScrollContainer, ScaleDecorator, ShadowDecorator } from 'react-native-draggable-flatlist'
import useCreateformStyle from '@/styles/createform';
import { IconButton } from 'react-native-paper';
import { useRes } from '../contexts/useRes';
import { useTheme } from '../contexts/useTheme';
import { spacing } from "@/constants/Spacing";

const TestComponent = React.memo(() => {
    const createform = useCreateformStyle();
    const { theme } = useTheme();
    const { fontSize } = useRes();

    const [data, setData] = useState([
        { SFormID: 1, SFormName: "1" },
        { SFormID: 2, SFormName: "2" },
        { SFormID: 3, SFormName: "3" },
        { SFormID: 4, SFormName: "4" },
        { SFormID: 5, SFormName: "5" },
        { SFormID: 6, SFormName: "6" },
        { SFormID: 7, SFormName: "7" },
        { SFormID: 8, SFormName: "8" },
        { SFormID: 9, SFormName: "9" },
        { SFormID: 10, SFormName: "10" },
        { SFormID: 11, SFormName: "11" },
        { SFormID: 12, SFormName: "12" },
    ]);

    const RowItem = ({ item, drag, isActive }: any) => {
        return (
            <Pressable
                onLongPress={drag}
                disabled={isActive}
                style={[
                    createform.subFormContainer,
                    isActive ? createform.active : null,
                ]}
                testID={`dg-SF-${item.SFormID}`}
            >
                <IconButton
                    icon={"credit-card-plus"}
                    iconColor={theme.colors.fff}
                    size={spacing.large}
                    style={createform.icon}
                    animated
                />
                <Text
                    style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}
                >
                    {item.SFormName}
                </Text>
                <IconButton
                    icon="chevron-right"
                    iconColor={theme.colors.fff}
                    size={spacing.large}
                    style={createform.icon}
                    animated
                />
            </Pressable>
        );
    }

    const renderSubForm = useCallback((params: any) => {
        return (
            <ShadowDecorator>
                <ScaleDecorator activeScale={0.90}>
                    <RowItem {...params} />
                </ScaleDecorator>
            </ShadowDecorator>
        );
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <NestableScrollContainer
                style={{
                    paddingHorizontal: fontSize === "large" ? 30 : 25,
                    paddingTop: 5,
                    paddingBottom: 50,
                }}
            >
                <NestableDraggableFlatList
                    data={data}
                    renderItem={renderSubForm}
                    keyExtractor={(item, index) => `SF-${item.SFormID}-${index}`}
                    onDragEnd={({ data }) => setData(data)}
                    activationDistance={2}
                    ListFooterComponent={<View style={{ paddingBottom: 50, marginBottom: 50 }} />}
                    ListHeaderComponent={<View style={{ paddingTop: 50, marginTop: 50 }} />}
                />
            </NestableScrollContainer>
        </View>
    );
});

export default TestComponent;
