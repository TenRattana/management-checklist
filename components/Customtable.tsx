import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRes } from "@/app/contexts/useRes";
import AccessibleView from "@/components/AccessibleView";
import CustomtableHead from "./table/CustomtableHead";
import CustomtableSmall from "./table/CustomtableSmall";
import CustomtableData from "./table/CustomtableData";
import { CustomTableProps } from '@/typing/tag';
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";

const CustomTable = React.memo(({ Tabledata, Tablehead, flexArr, handleAction, actionIndex, searchQuery, showMessage, selectedRows, setRow, showFilter, showData, showColumn, detail, detailData, detailKey, detailKeyrow, showDetailwithKey, ShowTitle, handlePaginationChange }: CustomTableProps) => {
  const [displayData, setDisplayData] = useState<(string | number | boolean)[][]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ column: number | null; direction: "ascending" | "descending" | undefined }>({
    column: null,
    direction: undefined,
  });

  const masterdataStyles = useMasterdataStyles();

  const [currentPage, setCurrentPage] = useState(0);

  const [pageSize, setPageSize] = useState<number>(100);

  const toggleSelectAll = useCallback(() => {
    if (selectedRows && setRow) {
      if (selectedRows.length === displayData.length) {
        setRow([]);
      } else {
        const selectedIndices = displayData.map((row, index) => {
          const selectIndex = actionIndex.find(item => item.selectIndex !== undefined)?.selectIndex;
          return Number(selectIndex) > -1 ? String(row[Number(selectIndex)]) : ""
        }).filter(v => v !== null)

        setRow(selectedIndices);
      }
    }
  }, [selectedRows, displayData, setRow])

  const toggleSelect = useCallback((value: string) => {
    if (selectedRows && setRow) {
      setRow(selectedRows.includes(value)
        ? selectedRows.filter((item) => item !== value)
        : [...selectedRows, value]);
    }
  }, [selectedRows, displayData, setRow])

  const { responsive } = useRes();

  const handleSort = useCallback((columnIndex: number) => {
    setSortConfig((prev) => ({
      column: prev?.column === columnIndex && prev.direction === "descending" ? null : columnIndex,
      direction: prev?.direction === "ascending" ? "descending" : prev?.direction === "descending" ? undefined : "ascending",
    }));
  }, []);

  const sortedData = useMemo(() => {
    if (!sortConfig.column) return Tabledata;
    return [...Tabledata].sort((a, b) => {
      const aValue = a[sortConfig.column!];
      const bValue = b[sortConfig.column!];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
    });
  }, [Tabledata, sortConfig]);

  const filteredData = useMemo(() => {
    return sortedData.filter((row) =>
      row.some((cell) => cell?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
    ).filter((row) => (filter ? row.includes(filter) : true));
  }, [sortedData, searchQuery, filter]);

  useEffect(() => {
    setDisplayData(filteredData);
  }, [filteredData]);

  const handleDialog = useCallback((action?: string, data?: string) => {
    if (handleAction) {
      handleAction(action, data);
    }
  }, [handleAction]);

  const handelSetFilter = useCallback((value: string) => {
    setFilter(value)
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  }

  useEffect(() => {
    handlePaginationChange && handlePaginationChange(currentPage, pageSize)
  }, [currentPage, pageSize])

  return (
    <AccessibleView name="customtable" style={{ flex: 1 }}>
      {responsive === "small" ? (
        <CustomtableSmall
          displayData={displayData}
          Tablehead={Tablehead}
          actionIndex={actionIndex}
          showMessage={showMessage}
          handleDialog={handleDialog}
          selectedRows={selectedRows}
          handelSetFilter={handelSetFilter}
          filter={filter}
          showColumn={showColumn}
          showData={showData}
          showFilter={showFilter}
          toggleSelect={toggleSelect}
          detail={detail}
          detailData={detailData}
          detailKey={detailKey}
          detailKeyrow={detailKeyrow}
          showDetailwithKey={showDetailwithKey}
          key={"CustomtableSmall"}
        />
      ) : (
        <AccessibleView name="data" style={{ flex: 1 }}>
          <CustomtableHead
            Tablehead={Tablehead}
            flexArr={flexArr}
            handleSort={handleSort}
            sortColumn={sortConfig.column}
            sortDirection={sortConfig.direction}
            selectedRows={selectedRows}
            toggleSelectAll={toggleSelectAll}
            displayData={displayData}
            handelSetFilter={handelSetFilter}
            filter={filter}
            showColumn={showColumn}
            showData={showData}
            showFilter={showFilter}
            handleDialog={handleDialog}
            ShowTitle={ShowTitle}
            key={"CustomtableHead"}
          />
          <CustomtableData
            Tablehead={Tablehead}
            actionIndex={actionIndex}
            displayData={displayData}
            flexArr={flexArr}
            handleDialog={handleDialog}
            selectedRows={selectedRows}
            toggleSelect={toggleSelect}
            showMessage={showMessage}
            detail={detail}
            detailData={detailData}
            detailKey={detailKey}
            detailKeyrow={detailKeyrow}
            showDetailwithKey={showDetailwithKey}
            key={"CustomtableData"}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 5 }}>
            <TouchableOpacity disabled={currentPage < 1} onPress={() => handlePageChange(currentPage - 1)} style={{ opacity: currentPage > 0 ? 1 : 0.5 }}>
              <Text style={masterdataStyles.text}>Prev</Text>
            </TouchableOpacity>
            <Text style={[{ marginHorizontal: 10 }, masterdataStyles.text]}>{currentPage + 1}</Text>
            <TouchableOpacity disabled={filteredData.length < pageSize} onPress={() => handlePageChange(currentPage + 1)} style={{ opacity: filteredData.length == pageSize ? 1 : 0.5 }}>
              <Text style={masterdataStyles.text}>Next</Text>
            </TouchableOpacity>
          </View>
        </AccessibleView>
      )}
    </AccessibleView>
  );
});

export default CustomTable;
