import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Pressable, Animated, FlatList, ScrollView, View, Platform } from "react-native";
import { DataTable, IconButton } from "react-native-paper";
import Dialogs from "@/components/common/Dialogs";
import { useRes, useToast, useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import Text from "@/components/Text";
import { CustomTableProps } from '@/typing/tag';
import useMasterdataStyles from "@/styles/common/masterdata";
import useCustomtableStyles from "@/styles/customtable";
import { savePaginate, loadPaginate } from '@/app/services/storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";

type justifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

const CustomTable = ({
  Tabledata,
  Tablehead,
  flexArr,
  handleAction,
  actionIndex,
  searchQuery,
  showMessage
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
  const [displayData, setDisplayData] = useState<(string | number | boolean)[][]>([]);

  const { theme } = useTheme();
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
  }, [Tabledata, itemsPerPage]);

  const handleSort = useCallback((columnIndex: number) => {
    setSortColumn(prev => (prev === columnIndex ? null : columnIndex));
    setSortDirection(prev => (prev === "ascending" ? "descending" : "ascending"));
  }, []);

  const sortedData = useMemo(() => {
    if (sortColumn === null) return Tabledata;

    return [...Tabledata].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortDirection === "ascending" ? aValue < bValue ? -1 : 1 : aValue > bValue ? -1 : 1;
    });
  }, [Tabledata, sortColumn, sortDirection]);

  const filteredData = useMemo(() => {
    return sortedData.filter(row =>
      row.some(cell => cell.toString().toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [sortedData, searchQuery]);

  useEffect(() => {
    setDisplayData(filteredData.slice(page * itemsPerPage, (page + 1) * itemsPerPage));
  }, [filteredData, page, itemsPerPage]);

  const handleDialog = useCallback((action?: string, data?: string) => {
    if (handleAction) {
      handleAction(action, data);
    }
  }, [handleAction]);

  const renderCellContent = useCallback((cell: string | number | boolean, cellIndex: number, row: (string | number | boolean)[], rowIndex: number, Canedit: string | number | boolean | undefined) => {
    if (typeof cell === "boolean") {
      const handlePress = () => {
        const status = row[cellIndex] ? "Inactive" : "Active";
        setDialogAction("activeIndex");
        setDialogTitle("Change Status");
        setDialogData(row[cellIndex + 1] as string);
        const message = Array.isArray(showMessage) ? showMessage.map(key => row[key]).join(" ") : row[showMessage];
        setDialogMessage(String(`${message} ${status}`));
        setIsVisible(Boolean(!Canedit));
      };

      return (
        <Pressable onPress={handlePress} key={`cell-content-${cellIndex}`}>
          <Animated.View style={{ transform: [{ scale: animations[rowIndex] }] }}>
            <IconButton
              icon={cell ? "toggle-switch" : "toggle-switch-off-outline"}
              size={spacing.large + 10}
              iconColor={cell ? theme.colors.green : theme.colors.secondary}
              disabled={Boolean(Canedit)}
            />
          </Animated.View>
        </Pressable>
      );
    }
    return <Text key={`cell-content-${cellIndex}`} style={masterdataStyles.text}>{String(cell)}</Text>;
  }, [theme.colors, animations]);

  const renderActionButton = useCallback((data: string, action: string, row: (string | number | boolean)[], rowIndex: number, Canedit: string | number | boolean | undefined) => {
    const handlePress = () => {
      setDialogAction(action);
      setDialogData(data);
      setDialogTitle(action === "editIndex" ? "Edit" : action === "delIndex" ? "Delete" : "");
      const message = Array.isArray(showMessage) ? showMessage.map(key => row[key]).join(" : ") : row[showMessage];
      setDialogMessage(String(message));
      setIsVisible((Boolean(!Canedit) || action === "editIndex"));
    };

    let icon;
    switch (action) {
      case "editOnlyIndex":
        icon = <IconButton icon="pencil-box" size={(responsive === "small" ? spacing.large : spacing.large) + 5} iconColor={theme.colors.blue} />
        break;
      case "editIndex":
        icon = <IconButton icon="pencil-box" size={(responsive === "small" ? spacing.large : spacing.large) + 5} iconColor={theme.colors.blue} />;
        break;
      case "delIndex":
        icon = <IconButton icon="trash-can" size={(responsive === "small" ? spacing.large : spacing.large) + 5} iconColor={theme.colors.error} disabled={Boolean(Canedit)} />;
        break;
      case "changeIndex":
        icon = <IconButton icon="tooltip-edit" size={(responsive === "small" ? spacing.large : spacing.large)} iconColor={theme.colors.yellow} disabled={Boolean(Canedit)} />
        break;
      case "copyIndex":
        icon = <IconButton icon="content-copy" size={(responsive === "small" ? spacing.large : spacing.large)} iconColor={theme.colors.yellow} />
        break;
      case "preIndex":
        icon = <IconButton icon="file-find" size={(responsive === "small" ? spacing.large : spacing.large) + 2} iconColor={theme.colors.yellow} />
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
            <Text style={[{ marginVertical: 5 }, masterdataStyles.text]}>{header.label}</Text>
            {actionIndex.map(actionItem => {
              const filteredEntries = Object.entries(actionItem).filter(([, value]) => value === colIndex);
              return filteredEntries.length > 0
                ? filteredEntries.map(([key]) => {
                  if (key === "editIndex" || key === "delIndex") {
                    return (
                      <AccessibleView name={`action-${rowIndex}-${colIndex}`} key={`action-${rowIndex}-${colIndex}`} style={customtable.eventColumn}>
                        <Text style={[masterdataStyles.text, { alignSelf: "center", }]}>Action : </Text>
                        {renderActionButton(rowData[colIndex] as string, "editIndex", rowData, rowIndex, rowData[actionItem.disables])}
                        {renderActionButton(rowData[colIndex] as string, "delIndex", rowData, rowIndex, rowData[actionItem.disables])}
                      </AccessibleView>
                    );
                  } else {
                    return (
                      <AccessibleView name={`action-${rowIndex}-${colIndex}`} key={`action-${rowIndex}-${colIndex}`} style={customtable.eventColumn}>
                        {renderActionButton(rowData[colIndex] as string, key, rowData, rowIndex, rowData[actionItem.disables])}
                      </AccessibleView>
                    )
                  }
                })
                : renderCellContent(rowData[colIndex], colIndex, rowData, rowIndex, rowData[actionItem.disables]);
            })}
          </AccessibleView>
        ))}
      </AccessibleView>
    );
  }, [renderCellContent, renderActionButton]);

  const renderTableData = useCallback((row: (string | number | boolean)[], rowIndex: number) => {
    return (
      <DataTable.Row key={`row-${rowIndex}`}>

        {row.map((cell, cellIndex) => {
          const Align: justifyContent = Tablehead[cellIndex]?.align as justifyContent;
          const justifyContent = {
            justifyContent: Align,
          };
          return (
            <DataTable.Cell key={`cell-${rowIndex}-${cellIndex}`} style={[justifyContent, { flex: flexArr[cellIndex] || 0 }]}>
              {actionIndex.map(actionItem => {
                const filteredEntries = Object.entries(actionItem).filter(([, value]) => value === cellIndex);
                return filteredEntries.length > 0
                  ? filteredEntries.map(([key]) => {
                    if (key === "editIndex" || key === "delIndex") {
                      return (
                        <AccessibleView name={`action-${rowIndex}-${key}`} key={`action-${rowIndex}`} style={customtable.eventColumn}>
                          {renderActionButton(row[cellIndex] as string, "editIndex", row, rowIndex, row[actionItem.disables])}
                          {renderActionButton(row[cellIndex] as string, "delIndex", row, rowIndex, row[actionItem.disables])}
                        </AccessibleView>
                      );
                    } else {
                      return (
                        <AccessibleView name={`action-${rowIndex}-${key}`} key={`action-${rowIndex}`} style={customtable.eventColumn}>
                          {renderActionButton(row[cellIndex] as string, key, row, rowIndex, row[actionItem.disablesit])}
                        </AccessibleView>
                      )
                    }
                  })
                  : renderCellContent(cell, cellIndex, row, rowIndex, row[actionItem.disables]);
              })}
            </DataTable.Cell>
          );
        })}
      </DataTable.Row>
    );
  }, [renderCellContent, renderActionButton]);

  return (
    <AccessibleView name="customtable" style={{ flex: 1 }} >
      {responsive === "small" ? (
        <AccessibleView name="small" style={{ flex: 1, marginTop: 20 }} >
          {filteredData.length === 0 ? (
            <Text style={[{ textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 }, masterdataStyles.text]}>No data found...</Text>
          ) : (
            <FlatList
              data={filteredData.length > 0 ? displayData : []}
              renderItem={({ item, index }) => renderSmallRes(item, index)}
              keyExtractor={(item, index) => `row-${index}`}
              ListEmptyComponent={() => (
                <Text style={[{ textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 }, masterdataStyles.text]}>No data found...</Text>
              )}
              contentContainerStyle={{ flexGrow: 1 }}
            />
          )}
        </AccessibleView>
      ) :
        <AccessibleView name="data" style={{ flex: 1 }}>
          <DataTable>
            <DataTable.Header>
              {Tablehead.map((header, index) => {
                const Align: justifyContent = Tablehead[index]?.align as justifyContent;
                const justifyContent = {
                  justifyContent: Align,
                };
                return (
                  <DataTable.Title
                    key={`header-${index}`}
                    onPress={() => handleSort(index)}
                    style={[{ flex: flexArr[index] || 0 }, justifyContent]}
                  >
                    <Text style={[masterdataStyles.textBold, masterdataStyles.text]}>{header.label}</Text>
                    {sortColumn === index && (sortDirection === "ascending" ? " ▲" : " ▼")}
                  </DataTable.Title>
                )
              })}
            </DataTable.Header>
          </DataTable>

          <FlatList
            data={filteredData.length > 0 ? displayData : []}
            renderItem={({ item, index }) => (
              <View key={`row-${index}`}>{renderTableData(item, index)}</View>
            )}
            keyExtractor={(item, index) => `row-${index}`}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 }}>No data found...</Text>
            )}
            contentContainerStyle={{ flexGrow: 1 }}
            nestedScrollEnabled={true}
            removeClippedSubviews
            initialNumToRender={10}
            showsVerticalScrollIndicator={true}
          />
          <DataTable.Pagination
            style={[{ paddingTop: 5 }]}
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
        </AccessibleView>
      }
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