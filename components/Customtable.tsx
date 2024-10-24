import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Pressable, Animated, ScrollView, FlatList, Dimensions, Platform } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { DataTable, IconButton } from "react-native-paper";
import Dialogs from "@/components/common/Dialogs";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRes, useToast } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import Text from "@/components/Text";
import { CustomTableProps } from '@/typing/tag';
import useMasterdataStyles from "@/styles/common/masterdata";
import useCustomtableStyles from "@/styles/customtable";
import { savePaginate, loadPaginate } from '@/app/services/storage';

type justifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

const CustomTable = ({
  Tabledata,
  Tablehead,
  flexArr,
  handleAction,
  actionIndex,
  searchQuery,
}: CustomTableProps) => {

  const [page, setPage] = useState<number>(0);
  const [numberOfItemsPerPageList] = useState([10, 20, 50]);
  const [itemsPerPage, onItemsPerPageChange] = useState(numberOfItemsPerPageList[0]);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | undefined>(undefined);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<string>("");
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [dialogData, setDialogData] = useState<string>("");
  console.log("CustomTable");

  const colors = useThemeColor();
  const { fontSize, responsive, spacing } = useRes();
  const { handleError } = useToast();
  const customtable = useCustomtableStyles();
  const masterdataStyles = useMasterdataStyles();
  const animations = useRef(Tabledata.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    console.log("loadPagination");

    const loadPagination = async () => {
      const paginate = await loadPaginate();
      if (paginate) onItemsPerPageChange(paginate.paginate);
    };
    loadPagination();
  }, [loadPaginate]);

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage, searchQuery, sortColumn, sortDirection]);

  const handleSort = useCallback((columnIndex: number) => {
    setSortColumn(prev => (prev === columnIndex ? null : columnIndex));
    setSortDirection(prev => (prev === "ascending" ? "descending" : "ascending"));
    console.log("handleSort");

  }, [setSortColumn, setSortDirection]);

  const sortedData = useMemo(() => {
    console.log("sortedData");

    return [...Tabledata].sort((a, b) => {
      if (sortColumn === null) return 0;
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "ascending"
        ? aValue < bValue ? -1 : 1
        : aValue > bValue ? -1 : 1;
    });

  }, [Tabledata, sortColumn, sortDirection]);

  const filteredData = useMemo(() => {
    console.log("filteredData");

    return sortedData.filter((row) =>
      row.some((cell) =>
        cell.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [sortedData, searchQuery]);

  const handleDialog = useCallback((action?: string, data?: string) => {
    if (handleAction) {
      handleAction(action, data);
    }
  }, [handleAction]);

  const currentData = useMemo(() => {
    console.log("currentData");
    if (!filteredData) return [];

    return filteredData.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  const renderCellContent = useCallback((
    cell: string | number | boolean,
    cellIndex: number,
    row: (string | number | boolean)[],
    rowIndex: number
  ) => {

    if (typeof cell === "boolean") {
      const handlePress = () => {
        try {
          Animated.sequence([
            Animated.timing(animations[rowIndex], {
              toValue: 0.8,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(animations[rowIndex], {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();
        } catch (error) {
          handleError(error);
        }

        const status = row[cellIndex] ? "Inactive" : "Active";
        setDialogAction("activeIndex");
        setDialogTitle("Change Status");
        setDialogData(row[cellIndex + 1] as string);
        setDialogMessage(`${row[0]}  ${status}`);
        setIsVisible(true);
      };

      return (
        <Pressable onPress={handlePress} key={`cell-content-${cellIndex}`}>
          <Animated.View style={{ transform: [{ scale: animations[rowIndex] }] }}>
            <IconButton
              icon={cell ? "toggle-switch" : "toggle-switch-off-outline"}
              size={(responsive === "small" ? spacing.large : spacing.large) + 10}
              iconColor={cell ? colors.succeass : colors.main}
            />
          </Animated.View>
        </Pressable>
      );
    }
    return <Text key={`cell-content-${cellIndex}`}>{cell as string}</Text>;
  }, [setDialogAction, setDialogTitle, setDialogData, setDialogMessage, setIsVisible]);


  const renderActionButton = useCallback((
    data: string,
    action: string,
    row: (string | number | boolean)[],
    rowIndex: number
  ) => {

    const handlePress = () => {
      if (action === "preIndex") {
        handleDialog(action, data);
      } else {
        setDialogAction(action);
        setDialogData(data);
        setDialogTitle(action === "editIndex" ? "Edit" : action === "Delete" ? "Delete" : action === "changeIndex" ? "Change Data Form" : action === "copyIndex" ? "Copy Template" : action === "preIndex" ? "Preview Form" : action === "editOnlyIndex" ? "Edit" : "");
        setDialogMessage(`${row[0]}`);
        setIsVisible(true);
      }
    };

    let icon;
    switch (action) {
      case "editOnlyIndex":
        icon = (
          <IconButton
            icon="pencil-box"
            size={(responsive === "small" ? spacing.large : spacing.large) + 5}
            iconColor={colors.main}
          />
        );
        break;
      case "editIndex":
        icon = (
          <IconButton
            icon="pencil-box"
            size={(responsive === "small" ? spacing.large : spacing.large) + 5}
            iconColor={colors.main}
          />
        );
        break;
      case "delIndex":
        icon = (
          <IconButton
            icon="trash-can"
            size={(responsive === "small" ? spacing.large : spacing.large) + 5}
            iconColor={colors.danger}
          />
        );
        break;
      case "changeIndex":
        icon = (
          <IconButton
            icon="tooltip-edit"
            size={(responsive === "small" ? spacing.large : spacing.large) + 5}
            iconColor={colors.danger}
          />
        );
        break;
      case "copyIndex":
        icon = (
          <IconButton
            icon="content-copy"
            size={(responsive === "small" ? spacing.large : spacing.large) + 5}
            iconColor={colors.danger}
          />
        );
        break;
      case "preIndex":
        icon = (
          <IconButton
            icon="file-find"
            size={(responsive === "small" ? spacing.large : spacing.large) + 5}
            iconColor={colors.danger}
          />
        );
        break;
      default:
        return null;
    }

    return (
      <Pressable onPress={handlePress} key={`action-${action}`} style={customtable.eventCell}>
        {icon}
      </Pressable>
    );
  }, [handleDialog, setDialogAction, setDialogTitle, setDialogMessage, setIsVisible]);

  const renderSmallRes = useCallback((rowData: (string | number | boolean)[], rowIndex: number) => {

    return (
      <AccessibleView name={`row-${rowIndex}`} key={`row-${rowIndex}`} style={[customtable.cardRow, { alignItems: 'flex-start' }]}>
        {Tablehead.map((header, colIndex) => (
          <AccessibleView name={`header-${rowIndex}-${colIndex}`} key={`header-${rowIndex}-${colIndex}`}>
            <Text style={{ marginVertical: 5 }}>
              {header.label}
            </Text>
            {actionIndex.map((actionItem) => {
              const filteredEntries = Object.entries(actionItem).filter(
                ([, value]) => value === colIndex
              );

              return filteredEntries.length > 0
                ? filteredEntries.map(([key]) => {
                  if (key === "editIndex" || key === "delIndex") {
                    return (
                      <AccessibleView name={`action-${rowIndex}`} key={`action-${rowIndex}`} style={customtable.eventColumn}>
                        {key === "editIndex" && renderActionButton(rowData[colIndex] as string, "editIndex", rowData, rowIndex)}
                        {key === "delIndex" && renderActionButton(rowData[colIndex] as string, "delIndex", rowData, rowIndex)}
                      </AccessibleView>
                    );
                  } else {
                    return (
                      <AccessibleView name={`action-${rowIndex}`} key={`action-${rowIndex}`} style={customtable.eventColumn}>
                        {renderActionButton(rowData[colIndex] as string, key, rowData, rowIndex)}
                      </AccessibleView>
                    )
                  }
                })
                : renderCellContent(rowData[colIndex], colIndex, rowData, rowIndex);
            })}
          </AccessibleView>
        ))}
      </AccessibleView>
    )
  }, [renderCellContent, renderActionButton])

  const renderTableData = useCallback((row: any, rowIndex: number) => {

    return (
      <DataTable.Row key={`row-${rowIndex}`}>
        {row.map((cell: any, cellIndex: number) => {
          const Align: justifyContent = Tablehead[cellIndex]?.align as justifyContent;
          const justifyContent = {
            justifyContent: Align,
          };
          return (
            <DataTable.Cell key={`cell-${rowIndex}-${cellIndex}`}
              style={[justifyContent, { flex: flexArr[cellIndex] || 1 }]}>
              {actionIndex.map((actionItem) => {
                const filteredEntries = Object.entries(actionItem).filter(
                  ([, value]) => value === cellIndex
                );

                return filteredEntries.length > 0
                  ? filteredEntries.map(([key]) => {
                    if (key === "editIndex" || key === "delIndex") {
                      return (
                        <AccessibleView name={`action-${rowIndex}`} key={`action-${rowIndex}`} style={customtable.eventColumn}>
                          {renderActionButton(row[cellIndex] as string, "editIndex", row, rowIndex)}
                          {renderActionButton(row[cellIndex] as string, "delIndex", row, rowIndex)}
                        </AccessibleView>
                      );
                    } else {
                      return (
                        <AccessibleView name={`action-${rowIndex}`} key={`action-${rowIndex}`} style={customtable.eventColumn}>
                          {renderActionButton(row[cellIndex] as string, key, row, rowIndex)}
                        </AccessibleView>
                      )
                    }
                  })
                  : renderCellContent(cell, cellIndex, row, rowIndex);
              })}
            </DataTable.Cell>
          );
        })}
      </DataTable.Row>
    )
  }, [renderCellContent, renderActionButton])

  return (
    <AccessibleView name="customtable">
      {responsive === "small" ?
        filteredData && filteredData.length === 0 ? (
          <Text style={{ textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 }}>No data found...</Text>
        ) : (
          currentData.map((rowData, rowIndex) => (
            renderSmallRes(rowData, rowIndex)
          ))
        ) : (
          <DataTable>
            <DataTable.Header>
              {Tablehead.map((header, index) => (
                <DataTable.Title
                  key={`header-${index}`}
                  sortDirection={sortColumn === index ? sortDirection : undefined}
                  onPress={() => handleSort(index)}
                  style={{ justifyContent: header.align as justifyContent, flex: flexArr[index] || 1, marginVertical: spacing.small - 10 }}
                  textStyle={[masterdataStyles.text]}
                >
                  <Text style={masterdataStyles.title}>{header.label}</Text>
                </DataTable.Title>
              ))}
            </DataTable.Header>

            <FlatList
              data={filteredData.length > 0 ? currentData : []}
              renderItem={({ item, index }) => renderTableData(item, index)}
              keyExtractor={(item, index) => `row-${index}`}
              ListEmptyComponent={() => (
                <Text style={{ textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 }}>
                  No data found...
                </Text>
              )}
              style={{ maxHeight: hp(fontSize === "small" ? '55%' : fontSize === "medium" ? '52%' : '45%') }}
            />

            <DataTable.Pagination
              style={{ paddingTop: 5 }}
              page={page}
              numberOfPages={Math.ceil(filteredData.length / itemsPerPage)}
              onPageChange={(newPage) => setPage(newPage)}
              label={`Page ${page + 1} of ${Math.ceil(filteredData.length / itemsPerPage)}`}
              numberOfItemsPerPage={itemsPerPage}
              numberOfItemsPerPageList={numberOfItemsPerPageList}
              onItemsPerPageChange={(value) => {
                onItemsPerPageChange(value);
                savePaginate({ paginate: value });
              }}
              showFastPaginationControls
              selectPageDropdownLabel={"Rows per page"}
            />
          </DataTable>
        )}
      <Dialogs
        isVisible={isVisible}
        title={dialogTitle}
        setIsVisible={setIsVisible}
        handleDialog={handleDialog}
        actions={dialogAction}
        messages={dialogMessage}
        data={dialogData}
      />
    </AccessibleView>
  );
};

export default React.memo(CustomTable);
