import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Text, Pressable, Animated, StyleSheet } from "react-native";
import { DataTable, IconButton, Divider } from "react-native-paper";
import Dialogs from "@/components/common/Dialogs";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRes, useToast } from "@/app/contexts";
import useMasterdataStyles from "@/styles/common/masterdata";
import useCustomtableStyles from "@/styles/customtable";
import AccessibleView from "@/components/AccessibleView";
interface CustomTableProps {
  Tabledata: (string | number | boolean)[][];
  Tablehead: { label?: string; align?: string }[];
  flexArr: number[];
  handleAction: (action?: string, data?: string) => void;
  actionIndex: { [key: string]: number }[];
  searchQuery: string;
}

type justifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined;

const CustomTable: React.FC<CustomTableProps> = React.memo(
  ({
    Tabledata,
    Tablehead,
    flexArr,
    handleAction,
    actionIndex,
    searchQuery,
  }) => {
    const [page, setPage] = useState<number>(0);
    const [numberOfItemsPerPageList] = React.useState([5, 10, 15]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
      numberOfItemsPerPageList[0]
    );
    const [sortColumn, setSortColumn] = useState<number | null>(null);
    const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | undefined>(undefined);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [dialogAction, setDialogAction] = useState<string>("");
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [dialogTitle, setDialogTitle] = useState<string>("");
    const [dialogData, setDialogData] = useState<string>("");

    const masterdataStyles = useMasterdataStyles();
    const customtable = useCustomtableStyles();

    const colors = useThemeColor();
    const { spacing, responsive } = useRes();
    const { showSuccess, showError } = useToast();

    const errorMessage = useCallback((error: unknown) => {
      let errorMessage: string | string[];

      if (error instanceof Error) {
        errorMessage = [error.message];
      } else {
        errorMessage = ["An unknown error occurred!"];
      }

      showError(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
    }, [showError]);

    const animations = useRef(
      Tabledata.map(() => new Animated.Value(1))
    ).current;

    useEffect(() => {
      setPage(0);
    }, [itemsPerPage, searchQuery, sortColumn, sortDirection]);

    const handleSort = (columnIndex: number) => {
      if (sortColumn === columnIndex) {
        setSortDirection(
          sortDirection === "ascending" ? "descending" : "ascending"
        );
      } else {
        setSortColumn(columnIndex);
        setSortDirection("ascending");
      }
    };

    const sortedData = useMemo(() => {
      return [...Tabledata].sort((a, b) => {
        if (sortColumn !== null) {
          const aValue = a[sortColumn];
          const bValue = b[sortColumn];
          if (aValue < bValue) return sortDirection === "ascending" ? -1 : 1;
          if (aValue > bValue) return sortDirection === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }, [Tabledata, sortColumn, sortDirection]);

    const filteredData = useMemo(() => {
      return sortedData.filter((row) =>
        row.some((cell) =>
          cell.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }, [sortedData, searchQuery]);

    const handleDialog = (action?: string, data?: string) => {
      handleAction(action, data);
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
          setDialogTitle(action === "editIndex" ? "Edit" : "Delete");
          setDialogMessage(`${row[0]}`);
          setIsVisible(true);
        }
      };

      let icon;
      switch (action) {
        case "editIndex":
          icon = <IconButton icon="pencil-box" size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium} style={customtable.icon} iconColor={colors.main} />;
          break;
        case "delIndex":
          icon = <IconButton icon="trash-can" size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium} style={customtable.icon} iconColor={colors.danger} />;
          break;
        case "changeIndex":
          icon = <IconButton icon="note-edit" size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium} style={customtable.icon} iconColor={colors.dark} />;
          break;
        case "copyIndex":
          icon = <IconButton icon="content-copy" size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium} style={customtable.icon} iconColor={colors.dark} />;
          break;
        case "preIndex":
          icon = <IconButton icon="file-find" size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium} style={customtable.icon} iconColor={colors.yellow} />;
          break;
        default:
          return null;
      }

      return (
        <Pressable style={[customtable.container, customtable.iconAction]} onPress={handlePress} key={`action-${action}`}>
          {icon}
        </Pressable>
      );
    };

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
            errorMessage(error)
          }

          const status = row[cellIndex] ? "In active" : "Active";

          setDialogAction("activeIndex");
          setDialogTitle("Change Status");
          setDialogData(row[cellIndex + 1] as string);
          setDialogMessage(`${row[0]}  ${status}`);
          setIsVisible(true);
        };

        return (
          <Pressable
            style={responsive === "small"
              ? { justifyContent: "flex-start" }
              : { justifyContent: "center" }}
            key={`cell-content-${cellIndex}`} onPress={handlePress}>

            <Animated.View style={{ transform: [{ scale: animations[rowIndex] }] }}>
              <IconButton
                icon={cell ? "toggle-switch" : "toggle-switch-off-outline"}
                size={responsive === "small" ? 20 + spacing.medium : 10 + spacing.medium} style={customtable.icon}
                iconColor={cell ? colors.succeass : colors.main}
              />
            </Animated.View>
          </Pressable>
        );
      }
      return <Text style={[masterdataStyles.text, masterdataStyles.textDark]} key={`cell-content-${cellIndex}`}>{cell}</Text>;
    };

    const currentData = useMemo(() => {
      return filteredData.slice(
        page * itemsPerPage,
        (page + 1) * itemsPerPage
      );
    }, [filteredData, page, itemsPerPage]);

    return (
      <AccessibleView style={{ marginVertical: 20 }}>
        {responsive === "small" ? (
          currentData.map((rowData, rowIndex) => (
            <AccessibleView key={`row-${rowIndex}`} style={[customtable.cardRow, { alignItems: 'flex-start' }]}>
              {Tablehead.map((header, colIndex) => (
                <AccessibleView key={`header-${rowIndex}-${colIndex}`}>
                  <Text style={[masterdataStyles.text, masterdataStyles.textError, { marginVertical: 5 }]}>
                    {header.label}:
                  </Text>
                  {actionIndex.map((actionItem) => {
                    const filteredEntries = Object.entries(actionItem).filter(
                      ([, value]) => value === colIndex
                    );

                    return filteredEntries.length > 0 ? (
                      filteredEntries.map(([key]) =>
                        renderActionButton(rowData[colIndex] as string, key, rowData, rowIndex)
                      )
                    ) : (
                      renderCellContent(rowData[colIndex], colIndex, rowData, rowIndex)
                    );
                  })}
                </AccessibleView>
              ))}
            </AccessibleView>
          ))
        ) : (
          <DataTable style={{ backgroundColor: colors.light, borderRadius: 8 }}>
            <DataTable.Header>
              {Tablehead.map((header, index) => (
                <DataTable.Title
                  key={`header-${index}`}
                  style={{
                    flex: flexArr[index] || 1,
                    justifyContent: "center",
                    marginVertical: 20
                  }}
                  sortDirection={sortColumn === index ? sortDirection : undefined}
                  onPress={() => handleSort(index)}
                >
                  <Text
                    style={[
                      masterdataStyles.text,
                      sortColumn === index ? masterdataStyles.textBold : undefined,
                    ]}
                  >
                    {header.label}
                  </Text>
                </DataTable.Title>
              ))}
            </DataTable.Header>

            {filteredData.length === 0 ? (
              <Text style={[masterdataStyles.text, masterdataStyles.textItalic, { textAlign: 'center', paddingTop: 10 }]}>No data found...</Text>
            ) : (
              currentData.map((row, rowIndex) => (
                <DataTable.Row key={`row-${rowIndex}`} style={[customtable.row]}>
                  {row.map((cell, cellIndex) => {
                    const Align: justifyContent = Tablehead[cellIndex]?.align as justifyContent;
                    const justifyContent = {
                      justifyContent: Align,
                      paddingLeft: 8,
                    };
                    return (
                      <DataTable.Cell
                        key={`cell-${rowIndex}-${cellIndex}`}
                        style={[justifyContent, { flex: flexArr[cellIndex] || 1 }]}
                      >
                        {actionIndex.map((actionItem) => {
                          const filteredEntries = Object.entries(actionItem).filter(
                            ([, value]) => value === cellIndex
                          );

                          return filteredEntries.length > 0 ? (
                            filteredEntries.map(([key]) =>
                              renderActionButton(cell as string, key, row, rowIndex)
                            )
                          ) : (
                            renderCellContent(cell, cellIndex, row, rowIndex)
                          );
                        })}
                      </DataTable.Cell>
                    );
                  })}
                </DataTable.Row>
              ))
            )}
            <DataTable.Pagination
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
  }
);

export default CustomTable;
