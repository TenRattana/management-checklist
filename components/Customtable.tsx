import React, { useRef, useMemo, useState, useEffect } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { DataTable, IconButton } from "react-native-paper";
import Dialogs from "@/components/common/Dialogs";

interface CustomTableProps {
  Tabledata: (string | number | boolean)[][];
  Tablehead: string[];
  flexArr: number[];
  handleAction: (action?: string, data?: string) => void;
  actionIndex: { [key: string]: number }[];
  searchQuery: string;
}

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
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [sortColumn, setSortColumn] = useState<number | null>(null);
    const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [dialogAction, setDialogAction] = useState<string>("");
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [dialogTitle, setDialogTitle] = useState<string>("");
    const [dialogData, setDialogData] = useState<string>("");

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
          icon = <IconButton icon="pencil-box" size={27} />;
          break;
        case "delIndex":
          icon = <IconButton icon="trash-can" size={28} />;
          break;
        case "changeIndex":
          icon = <IconButton icon="note-edit" size={28} />;
          break;
        case "copyIndex":
          icon = <IconButton icon="content-copy" size={24} />;
          break;
        case "preIndex":
          icon = <IconButton icon="file-find" size={26} />;
          break;
        default:
          return null;
      }

      return (
        <Pressable onPress={handlePress} key={`action-${action}`}>
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

          const status = row[cellIndex] ? "In active" : "Active";

          setDialogAction("activeIndex");
          setDialogTitle("Change Status");
          setDialogData(row[cellIndex + 1] as string);
          setDialogMessage(`${row[0]}  ${status}`);
          setIsVisible(true);
        };

        return (
          <Pressable key={`cell-content-${cellIndex}`} onPress={handlePress}>
            <Animated.View style={{ transform: [{ scale: animations[rowIndex] }] }}>
              <IconButton
                icon={cell ? "toggle-switch" : "toggle-switch-off-outline"}
                size={32}
              />
            </Animated.View>
          </Pressable>
        );
      }
      return <Text key={`cell-content-${cellIndex}`}>{cell}</Text>;
    };

    const currentData = useMemo(() => {
      return filteredData.slice(
        page * itemsPerPage,
        (page + 1) * itemsPerPage
      );
    }, [filteredData, page, itemsPerPage]);

    if ("small") {
      return currentData.map((rowData, headerIndex) => (
        <View key={`row-${headerIndex}`}>
          {Tablehead.map((header, i) => (
            <View key={`header-${headerIndex}-${i}`}>
              <Text>{header}:</Text>
              {renderCellContent(rowData[i], i, rowData, headerIndex)}
            </View>
          ))}
          <View style={{ flexDirection: "row" }}>
            {Object.entries(actionIndex[0]).map(
              ([key, value]) =>
                value >= 0 &&
                renderActionButton(rowData[value] as string, key, rowData, headerIndex)
            )}
          </View>
        </View>
      ));
    } else {
      return (
        <View>
          <DataTable>
            <DataTable.Header>
              {Tablehead.map((header, index) => (
                <DataTable.Title
                  key={`header-${index}`}
                  style={{
                    flex: flexArr[index] || 1,
                    justifyContent: "center",
                  }}
                  sortDirection={sortColumn === index ? sortDirection : "ascending"} 
                  onPress={() => handleSort(index)}
                >
                  <Text>{header}</Text>
                </DataTable.Title>
              ))}
            </DataTable.Header>

            {filteredData.length === 0 ? (
              <Text>No data found...</Text>
            ) : (
              currentData.map((row, rowIndex) => (
                <DataTable.Row key={`row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <DataTable.Cell
                      key={`cell-${rowIndex}-${cellIndex}`}
                      style={{
                        flex: flexArr[cellIndex] || 1,
                        justifyContent: "center",
                      }}
                    >
                      {actionIndex.map((actionItem) => {
                        const filteredEntries = Object.entries(actionItem).filter(
                          ([, value]) => value === cellIndex
                        );

                        return filteredEntries.length > 0
                          ? filteredEntries.map(([key]) =>
                              renderActionButton(cell as string, key, row, rowIndex)
                            )
                          : renderCellContent(cell, cellIndex, row, rowIndex);
                      })}
                    </DataTable.Cell>
                  ))}
                </DataTable.Row>
              ))
            )}
            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(filteredData.length / itemsPerPage)}
              onPageChange={(newPage) => setPage(newPage)}
              label={`Page ${page + 1} of ${Math.ceil(
                filteredData.length / itemsPerPage
              )}`}
              numberOfItemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              showFastPaginationControls
              selectPageDropdownLabel={"Rows per page"}
            />
          </DataTable>

          <Dialogs
            isVisible={isVisible}
            title={dialogTitle}
            setIsVisible={setIsVisible}
            handleDialog={handleDialog}
            actions={dialogAction}
            messages={dialogMessage}
            data={dialogData}
          />
        </View>
      );
    }
  }
);

export default CustomTable;
