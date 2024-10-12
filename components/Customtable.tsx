import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Text, Pressable, Animated } from "react-native";
import { DataTable, IconButton } from "react-native-paper";
import Dialogs from "@/components/common/Dialogs";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRes, useToast } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
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

  // const colors = useThemeColor();
  const { responsive, spacing } = useRes();
  const { handleError } = useToast();
  const customtable = useCustomtableStyles();
  const masterdataStyles = useMasterdataStyles();
  const animations = useRef(Tabledata.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const loadPagination = async () => {
      const paginate = await loadPaginate();
      if (paginate) onItemsPerPageChange(paginate.paginate);
    };
    loadPagination();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage, searchQuery, sortColumn, sortDirection]);

  const handleSort = (columnIndex: number) => {
    setSortColumn(prev => (prev === columnIndex ? null : columnIndex));
    setSortDirection(prev => (prev === "ascending" ? "descending" : "ascending"));
  };

  const sortedData = useMemo(() => {
    return [...Tabledata].sort((a, b) => {
      if (sortColumn === null) return 0;
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      return sortDirection === "ascending"
        ? aValue < bValue ? -1 : 1
        : aValue > bValue ? -1 : 1;
    });
  }, [Tabledata, sortColumn, sortDirection]);

  const filteredData = useMemo(() => {
    return sortedData.filter((row) =>
      row.some((cell) =>
        cell.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [sortedData, searchQuery]);

  const handleDialog = useCallback((action?: string, data?: string) => {
    handleAction(action, data);
  }, [handleAction]);

  const currentData = useMemo(() => {
    return filteredData.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  const renderCellContent = (
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
              size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium}
            // iconColor={cell ? colors.succeass : colors.main}
            />
          </Animated.View>
        </Pressable>
      );
    }
    return <Text key={`cell-content-${cellIndex}`}>{cell}</Text>;
  };


  const renderActionButton = (
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
            size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium}
          // iconColor={colors.main}
          />
        );
        break;
      case "editIndex":
        icon = (
          <IconButton
            icon="pencil-box"
            size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium}
          // iconColor={colors.main}
          />
        );
        break;
      case "delIndex":
        icon = (
          <IconButton
            icon="trash-can"
            size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium}
          // iconColor={colors.danger}
          />
        );
        break;
      case "changeIndex":
        icon = (
          <IconButton
            icon="tooltip-edit"
            size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium}
          // iconColor={colors.danger}
          />
        );
        break;
      case "copyIndex":
        icon = (
          <IconButton
            icon="content-copy"
            size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium}
          // iconColor={colors.danger}
          />
        );
        break;
      case "preIndex":
        icon = (
          <IconButton
            icon="file-find"
            size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium}
          // iconColor={colors.danger}
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
  };

  const renderSmallRes = (rowData: (string | number | boolean)[], rowIndex: number) => {
    return (
      <AccessibleView name={`row-${rowIndex}`} key={`row-${rowIndex}`} style={[customtable.cardRow, { alignItems: 'flex-start' }]}>
        {Tablehead.map((header, colIndex) => (
          <AccessibleView name={`header-${rowIndex}-${colIndex}`} key={`header-${rowIndex}-${colIndex}`}>
            <Text style={[masterdataStyles.text, masterdataStyles.textError, { marginVertical: 5 }]}>
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
  }

  return (
    <AccessibleView name="customtable" style={customtable.containerContent}>
      {responsive === "small" ? (
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
                style={{ justifyContent: header.align as justifyContent, flex: flexArr[index] || 1 }}
              >
                {header.label}
              </DataTable.Title>
            ))}
          </DataTable.Header>

          {filteredData.length === 0 ? (
            <Text>No data found...</Text>
          ) : (
            currentData.map((row, rowIndex) => (
              <DataTable.Row key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => {
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
            ))
          )}

          <DataTable.Pagination
            style={{ paddingTop: 5 }}
            page={page}
            numberOfPages={Math.ceil(filteredData.length / itemsPerPage)}
            onPageChange={(newPage) => setPage(newPage)}
            label={`Page ${page + 1} of ${Math.ceil(filteredData.length / itemsPerPage)}`}
            numberOfItemsPerPage={itemsPerPage}
            numberOfItemsPerPageList={numberOfItemsPerPageList}
            onItemsPerPageChange={onItemsPerPageChange}
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
