import React, { useState } from "react";
import Text from "../Text";
import { Dialogs, LoadingSpinner } from "../common";
import useMasterdataStyles from "@/styles/common/masterdata";
import { Easing, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { FlatList } from "react-native-gesture-handler";
import { View } from "react-native";
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomtableDataProps } from "@/typing/screens/CustomTable";
import RenderItem from "./Contents/RenderItem";

FadeInUp.duration(300).easing(Easing.ease);
FadeOutDown.duration(300).easing(Easing.ease);

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
                    <RenderItem
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
                    <View style={{ height: 55, flexDirection: 'row', }}>
                        {flexArr.map((flex, idx) => (
                            <ShimmerPlaceholder key={idx} style={{ flex: flex, marginHorizontal: idx === 1 || idx === 0 ? 0 : 5, alignSelf: 'center', borderRadius: 10 }} />
                        ))}
                    </View>
                ) : (
                    <Text style={[masterdataStyles.text, { textAlign: 'center', fontStyle: 'italic' }]}>
                        No data found...
                    </Text>
                )}
                ListFooterComponent={() => displayData.length > 0 && isFetching && <View style={{ padding: 20 }}><LoadingSpinner /></View>}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
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
