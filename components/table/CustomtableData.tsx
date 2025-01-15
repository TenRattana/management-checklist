import React, { useState, Suspense } from "react";
import Text from "../Text";
import { Dialogs, LoadingSpinner } from "../common";
import { CustomtableDataProps } from "@/typing/tag";
import useMasterdataStyles from "@/styles/common/masterdata";
import { Easing, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { FlatList } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import ShimmerPlaceholder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

FadeInUp.duration(300).easing(Easing.ease);
FadeOutDown.duration(300).easing(Easing.ease);

const LazyRenderItem = React.lazy(() => import('./Contents/RenderItem'));

const CustomtableData = React.memo(({ Tablehead, flexArr, actionIndex, displayData, handleDialog, showMessage, selectedRows, toggleSelect, detail, detailKey, detailData, detailKeyrow, showDetailwithKey, handlePaginationChange, isFetching }: CustomtableDataProps) => {
    const masterdataStyles = useMasterdataStyles();
    const [dialogState, setDialogState] = useState({ isVisible: false, action: "", message: "", title: "", data: "" });
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

    const getItemLayout = (data: any, index: number) => ({
        length: 55,
        offset: 55 * index,
        index,
    });

    return (
        <>
            <FlatList
                data={displayData}
                renderItem={({ item, index }) =>
                    <LazyRenderItem
                        item={item}
                        index={index}
                        Tablehead={Tablehead}
                        actionIndex={actionIndex}
                        detail={detail}
                        detailData={detailData}
                        detailKey={detailKey}
                        detailKeyrow={detailKeyrow}
                        flexArr={flexArr}
                        selectedRows={selectedRows}
                        setDialogState={setDialogState}
                        showDetailwithKey={showDetailwithKey}
                        showMessage={showMessage}
                        toggleSelect={toggleSelect}
                        key={index}
                    />
                }
                keyExtractor={(item, index) => `${index}-${item}`}
                ListEmptyComponent={() => isFetching ? (
                    <View style={{ height: 55, flexDirection: 'row' }}>
                        {flexArr.map((flex, idx) => (
                            <View key={idx} style={{ flex: flex, marginTop: 10 }}>
                                <ShimmerPlaceholder key={idx} />
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={[masterdataStyles.text, { textAlign: 'center', fontStyle: 'italic' }]}>
                        No data found...
                    </Text>
                )}
                ListFooterComponent={() => displayData.length > 0 && isFetching && <View style={{ padding: 20 }}><LoadingSpinner /></View>}
                contentContainerStyle={{ flexGrow: 1 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                removeClippedSubviews
                onEndReachedThreshold={0.2}
                initialNumToRender={30}
                windowSize={10}
                // maxToRenderPerBatch={50}
                onEndReached={handlePaginationChange}
                getItemLayout={getItemLayout}
            />

            {dialogState.isVisible && (
                <Dialogs
                    isVisible={dialogState.isVisible}
                    title={dialogState.title}
                    setIsVisible={() =>
                        setDialogState((prev) => ({ ...prev, isVisible: false }))
                    }
                    handleDialog={handleDialog}
                    actions={dialogState.action}
                    messages={dialogState.message}
                    data={dialogState.data}
                    key={`dialog-datatable`}
                />
            )}
        </>
    );
}
);

export default CustomtableData;
