import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRes } from "@/app/contexts/useRes";
import CustomtableHead from "./table/CustomtableHead";
import CustomtableSmall from "./table/CustomtableSmall";
import CustomtableData from "./table/CustomtableData";
import { CustomTableProps } from '@/typing/tag';
import { View } from "react-native";
import { debounce, throttle } from "lodash";

const CustomTable = React.memo(({ Tabledata, Tablehead, flexArr, handleAction, actionIndex, searchQuery, showMessage, selectedRows, setRow,
  showFilter, showData, showColumn, detail, detailData, detailKey, detailKeyrow, showDetailwithKey, ShowTitle, handlePaginationChange }: CustomTableProps) => {

  const [displayData, setDisplayData] = useState<(string | number | boolean)[][]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ column: number | null; direction: "ascending" | "descending" | undefined }>({
    column: null,
    direction: undefined,
  });

  const { responsive } = useRes();

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
    return sortedData.filter((row) => {
      return row.some((cell) => cell?.toString().toLowerCase().includes(searchQuery.toLowerCase())) && (filter ? row.includes(filter) : true);
    });
  }, [sortedData, searchQuery, filter]);

  useEffect(() => {
    if (JSON.stringify(filteredData) !== JSON.stringify(displayData)) {
      setDisplayData(filteredData);
    }
  }, [filteredData, displayData]);

  const toggleSelectAll = throttle(() => {
    if (selectedRows && setRow) {
      if (selectedRows.length === displayData.length) {
        setRow([]);
      } else {
        const selectedIndices = displayData.map((row, index) => {
          const selectIndex = actionIndex.find(item => item.selectIndex !== undefined)?.selectIndex;
          return Number(selectIndex) > -1 ? String(row[Number(selectIndex)]) : "";
        }).filter(v => v !== null);

        setRow(selectedIndices);
      }
    }
  }, 300);

  const toggleSelect = useCallback((value: string) => {
    if (selectedRows && setRow) {
      const newSelectedRows = selectedRows.includes(value)
        ? selectedRows.filter((item) => item !== value)
        : [...selectedRows, value];

      setRow(newSelectedRows);
    }
  }, [selectedRows, setRow]);

  const handleSortDebounced = debounce((columnIndex) => {
    setSortConfig((prev) => ({
      column: prev?.column === columnIndex && prev.direction === "descending" ? null : columnIndex,
      direction: prev?.direction === "ascending" ? "descending" : prev?.direction === "descending" ? undefined : "ascending",
    }));
  }, 300);

  const handleDialog = useCallback((action?: string, data?: string) => {
    if (handleAction) {
      handleAction(action, data);
    }
  }, [handleAction]);

  const handelSetFilter = useCallback((value: string) => {
    setFilter(value);
  }, []);

  const MemoCustomtableSmall = React.memo(CustomtableSmall)
  const MemoCustomtableHead = React.memo(CustomtableHead)

  return (
    <View id="customtable" style={{ flex: 1 }}>
      {responsive === "small" ? (
        <MemoCustomtableSmall
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
        <View id="data" style={{ flex: 1 }}>
          <MemoCustomtableHead
            Tablehead={Tablehead}
            flexArr={flexArr}
            handleSort={handleSortDebounced}
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
            handlePaginationChange={handlePaginationChange}
            key={"CustomtableData"}
          />
        </View>
      )}
    </View>
  );
});

export default CustomTable;
