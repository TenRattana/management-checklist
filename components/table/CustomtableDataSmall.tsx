import React, { Suspense, useState } from "react";
import { FlatList } from "react-native";
import Text from "@/components/Text";
import useMasterdataStyles from "@/styles/common/masterdata";
import { Dialogs } from "../common";
import RenderItemSmallHead from "./Contents/RenderItemSmallHead";
import { CustomtableSmallProps } from "@/typing/screens/CustomTable";

const LazyRenderItemSmall = React.lazy(() => import('./Contents/RenderItemSmall'));

const CustomtableSmall = React.memo(({ displayData, Tablehead, actionIndex, showMessage, selectedRows, toggleSelect, detail, detailKey, detailData, detailKeyrow, showDetailwithKey,
    showFilter, filter, handelSetFilter, showData, showColumn, handlePaginationChange, handleDialog, ShowTitle, showFilterDate, filteredDate, Dates, handleLoadMore, isFetchingNextPage, hasNextPage, handlefilter, searchfilter
}: CustomtableSmallProps) => {

    const masterdataStyles = useMasterdataStyles();
    const [dialogState, setDialogState] = useState({ isVisible: false, action: "", message: "", title: "", data: "" });

    const getItemLayout = (data: any, index: number) => ({
        length: 159,
        offset: 159 * index,
        index,
    });

    return (
        <>
            <RenderItemSmallHead
                filteredDate={filteredDate}
                handelSetFilter={handelSetFilter}
                handleDialog={handleDialog}
                handlefilter={handlefilter}
                Dates={Dates}
                ShowTitle={ShowTitle}
                filter={filter}
                handleLoadMore={handleLoadMore}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                searchfilter={searchfilter}
                selectedRows={selectedRows}
                showData={showData}
                showFilter={showFilter}
                showFilterDate={showFilterDate}
                key={`rendersmallhead`}
            />

            <FlatList
                data={displayData.length > 0 ? displayData : []}
                renderItem={({ item, index }) =>
                    <Suspense fallback={<Text style={{ textAlign: 'center', fontStyle: 'italic', height: 58, alignContent: 'center', justifyContent: 'center' }}>Loading...</Text>}>
                        <LazyRenderItemSmall
                            Tablehead={Tablehead}
                            actionIndex={actionIndex}
                            detail={detail}
                            detailData={detailData}
                            detailKey={detailKey}
                            detailKeyrow={detailKeyrow}
                            index={index}
                            item={item}
                            selectedRows={selectedRows}
                            setDialogState={setDialogState}
                            showDetailwithKey={showDetailwithKey}
                            showMessage={showMessage}
                            toggleSelect={toggleSelect}
                            key={index}
                        />
                    </Suspense>
                }
                keyExtractor={(_, index) => `row-${index}`}
                ListEmptyComponent={() => (
                    <Text style={[masterdataStyles.text, { textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 }]}>
                        No data found...
                    </Text>
                )}
                contentContainerStyle={{ flexGrow: 1 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                removeClippedSubviews
                onEndReachedThreshold={0.2}
                initialNumToRender={30}
                // windowSize={50}
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
    )
})

export default CustomtableSmall