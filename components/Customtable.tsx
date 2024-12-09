import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRes } from "@/app/contexts/useRes";
import AccessibleView from "@/components/AccessibleView";
import CustomtableHead from "./table/CustomtableHead";
import CustomtableSmall from "./table/CustomtableSmall";
import CustomtableData from "./table/CustomtableData";
import { CustomTableProps } from '@/typing/tag';

const CustomTable = React.memo(({ Tabledata, Tablehead, flexArr, handleAction, actionIndex, searchQuery, showMessage, selectedRows, setRow, showFilter, showData, showColumn, detail, detailData, detailKey, detailKeyrow, showDetailwithKey }: CustomTableProps) => {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | undefined>(undefined);
  const [displayData, setDisplayData] = useState<(string | number | boolean)[][]>([]);
  const [filter, setFilter] = useState<string | null>(null);

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
    setSortColumn((prev) => (prev === columnIndex && sortDirection === "descending" ? null : columnIndex));
    setSortDirection((prev) =>
      prev === 'ascending' ? 'descending' : prev === "descending" ? undefined : prev === undefined ? 'ascending' : undefined
    );

  }, [sortDirection, sortColumn]);

  const sortedData = useMemo(() => {
    if (sortColumn === null) return Tabledata;

    return [...Tabledata].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortDirection === "ascending" ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
    });
  }, [Tabledata, sortColumn, sortDirection]);

  const filteredData = useMemo(() => {
    let data = sortedData.filter((row) =>
      row.some((cell) => cell.toString().toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filter) {
      data = data.filter((row) => row.includes(filter));
    }

    return data;
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
  }, [])

  return (
    <AccessibleView name="customtable" style={{ flex: 1 }} >
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
      ) :
        <AccessibleView name="data" style={{ flex: 1 }}>
          <CustomtableHead
            Tablehead={Tablehead}
            flexArr={flexArr}
            handleSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            selectedRows={selectedRows}
            toggleSelectAll={toggleSelectAll}
            displayData={displayData}
            handelSetFilter={handelSetFilter}
            filter={filter}
            showColumn={showColumn}
            showData={showData}
            showFilter={showFilter}
            handleDialog={handleDialog}
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
        </AccessibleView>
      }
    </AccessibleView>
  );
});

export default CustomTable;
