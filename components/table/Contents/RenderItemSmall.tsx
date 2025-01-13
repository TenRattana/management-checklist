import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback } from 'react'
import Cellcontent from './Cellcontent';
import Actioncontent from './Actioncontent';
import useCustomtableStyles from '@/styles/customtable';
import DetailContent from './Detailcontent';
import useMasterdataStyles from '@/styles/common/masterdata';
import { HandelPrssProps } from '@/typing/tag';

const CellcontentMemo = React.memo(Cellcontent);
const ActionContentMemo = React.memo(Actioncontent);

const RenderItemSmall = React.memo(({ item, index, Tablehead, actionIndex, detail, detailKey, detailData, detailKeyrow, selectedRows, toggleSelect, setDialogState, showMessage, showDetailwithKey }: {
    item: (string | number | boolean)[], index: number, Tablehead: { label?: string; align?: string; }[], actionIndex: { [key: string]: string | number; }[],
    detail: boolean | undefined, detailKey: string | undefined, detailData: any[] | undefined, detailKeyrow: number | undefined, showMessage: number, showDetailwithKey: string[] | undefined,
    selectedRows: string[] | undefined, toggleSelect: (value: string) => void,
    setDialogState: React.Dispatch<React.SetStateAction<{
        isVisible: boolean;
        action: string;
        message: string;
        title: string;
        data: string;
    }>>
}) => {
    const customtable = useCustomtableStyles();
    const masterdataStyles = useMasterdataStyles();

    const findIndex = (row: (string | number | boolean)[]) => {
        return detailData?.findIndex(item => {
            return detailKey && item[detailKey] === (detailKeyrow && row[Number(detailKeyrow)]);
        }) ?? -1;
    };

    const handlePress = useCallback(({ action, data, message, visible, Change }: HandelPrssProps) => {
        const title = Change || (action === "editIndex" ? "Edit" : action === "delIndex" ? "Delete" : "");
        const messages = Array.isArray(showMessage)
            ? showMessage.map((key) => message[key]).join(" ")
            : message[showMessage];

        setDialogState(prevState => ({
            ...prevState,
            isVisible: visible || ["editIndex", "changeIndex", "copyIndex", "preIndex"].includes(action),
            action,
            message: String(messages),
            title,
            data: String(data),
        }));
    }, [showMessage]);

    return (
        <View id={`container-${index}`} style={[customtable.cardRow, { alignItems: 'flex-start', paddingBottom: 10 }]}>
            {Tablehead.map((header, colIndex) => header.label !== "" && (
                <View id={`header-${index}-${colIndex}`} key={`cell-${index}-${colIndex}`} style={{ flex: 1, marginVertical: 5, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={masterdataStyles.text}>{header.label} : </Text>
                    {actionIndex.map((actionItem, index) => {

                        const actionProps = {
                            data: String(item[colIndex]),
                            rowIndex: index,
                            row: item,
                            Canedit: item[Number(actionItem["disables"])] || false,
                            Candel: item[Number(actionItem["delete"])],
                            handlePress,
                            selectedRows,
                            toggleSelect,
                        };

                        const filteredEntries = Object.entries(actionItem).filter(([, value]) => value === colIndex);

                        return filteredEntries.length > 0 ? filteredEntries.map(([key]) => {
                            if (key === "editIndex" || key === "delIndex") {
                                return (
                                    <View
                                        id={`action-${index}-${key}-${index}`}
                                        key={`action-${index}-${index}-${key}`}
                                        style={customtable.eventColumn}
                                    >
                                        <ActionContentMemo {...actionProps} action={'editIndex'} />
                                        <ActionContentMemo {...actionProps} action={'delIndex'} />
                                    </View>
                                );
                            } else {
                                return (
                                    <View
                                        id={`another-action-${index}-${key}-${index}`}
                                        key={`action-${index}-${index}-${key}`}
                                        style={customtable.eventColumn}
                                    >
                                        <ActionContentMemo {...actionProps} action={key} />
                                    </View>
                                );
                            }
                        })
                            : <CellcontentMemo
                                key={`cellcontent-${index}-${index}`}
                                cell={item[colIndex]}
                                cellIndex={colIndex}
                                row={item}
                                rowIndex={index}
                                Canedit={item[Number(actionItem['disables'])]}
                                Candel={item[Number(actionItem["delete"])]}
                                handlePress={handlePress}
                            />
                    })}
                </View>
            ))}

            {detail && (
                <View id="containerdetail" key={`index-${findIndex(item)}`} style={{ width: "100%" }}>
                    <DetailContent detailData={detailData?.[findIndex(item)] || []} showDetailwithKey={showDetailwithKey} />
                </View>
            )}
        </View>
    )
})

export default RenderItemSmall