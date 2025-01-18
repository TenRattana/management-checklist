import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRes } from "@/app/contexts/useRes";
import CustomtableHead from "./table/Contents/RenderItemHead";
import CustomtableSmall from "./table/CustomtableDataSmall";
import CustomtableData from "./table/CustomtableData";
import { View } from "react-native";
import { debounce, throttle } from "lodash";
import { CustomTableProps } from "@/typing/screens/CustomTable";

const CustomTable = React.memo(({ Tabledata, Tablehead, flexArr, handleAction, actionIndex, searchQuery, showMessage, selectedRows, setRow,
  showFilter, showData, showColumn, detail, detailData, detailKey, detailKeyrow, showDetailwithKey, ShowTitle, handlePaginationChange, isFetchingNextPage, hasNextPage, fetchNextPage,
  showFilterDate, setFilterDate, searchfilter, handlefilter, filterColumn, isFetching }: CustomTableProps) => {

  const [displayData, setDisplayData] = useState<(string | number | boolean)[][]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [Dates, setDate] = useState<string | null>(null);
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

  const parseDateFromString = (dateString: string): Date | null => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4}) เวลา (\d{2}):(\d{2})$/;
    const match = dateString.match(regex);

    if (match) {
      const day = match[1];
      const month = match[2];
      const year = match[3];
      const hour = match[4];
      const minute = match[5];

      const gregorianYear = parseInt(year) - 543;

      const validDateString = `${gregorianYear}-${month}-${day}T${hour}:${minute}:00`;

      const date = new Date(validDateString);

      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  };

  const filterDateHandler = (filter: string | null) => {
    const currentDate = new Date();

    if (setFilterDate)
      switch (filter) {
        case "Today":
          return sortedData.filter(row => {
            const rowDate = parseDateFromString(row[setFilterDate] as string);
            if (rowDate === null) return false;
            return rowDate.toDateString() === currentDate.toDateString();
          });
        case "This week":
          const startOfWeek = new Date();
          startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
          return sortedData.filter(row => {
            const rowDate = parseDateFromString(row[setFilterDate] as string);
            if (rowDate === null) return false;
            return rowDate >= startOfWeek && rowDate <= currentDate;
          });
        case "This month":
          return sortedData.filter(row => {
            const rowDate = parseDateFromString(row[setFilterDate] as string);
            if (rowDate === null) return false;
            return (
              rowDate.getFullYear() === currentDate.getFullYear() &&
              rowDate.getMonth() === currentDate.getMonth()
            );
          });
        default:
          return sortedData;
      }
  };

  const filteredData = useMemo(() => {
    const filteredByDate = filterDateHandler(Dates);

    return sortedData.filter((row) => {
      const matchesSearchQuery = row.some((cell) =>
        cell?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesDateFilter = Dates && filteredByDate ? filteredByDate.includes(row) : true;
      const matchesFilter = filter && filterColumn !== undefined ? row[filterColumn]?.toString().includes(filter) : true;

      return matchesSearchQuery && matchesFilter && matchesDateFilter;
    });
  }, [sortedData, searchQuery, filter, Dates]);

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

  const handelSetFilter = useCallback(debounce((value: string) => {
    setFilter(value);
  }, 300), []);

  const filteredDate = useCallback(debounce((value: string) => {
    setDate(value);
  }, 300), []);

  return (
    <View id="customtable" style={{ flex: 1, marginTop: 10 }}>
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
          handlePaginationChange={handlePaginationChange}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          handlefilter={handlefilter}
          searchfilter={searchfilter}
          ShowTitle={ShowTitle}
          showFilterDate={showFilterDate}
          filteredDate={filteredDate}
          Dates={Dates}
          key={"CustomtableSmall"}
        />
      ) : (
        <View id="data" style={{ flex: 1 }}>
          <CustomtableHead
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
            Dates={Dates}
            showColumn={showColumn}
            showData={showData}
            showFilter={showFilter}
            handleDialog={handleDialog}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            handleLoadMore={fetchNextPage}
            handlefilter={handlefilter}
            searchfilter={searchfilter}
            ShowTitle={ShowTitle}
            showFilterDate={showFilterDate}
            filteredDate={filteredDate}
            key={"CustomtableHead"}
          />
          <CustomtableData
            Tablehead={Tablehead}
            actionIndex={actionIndex}
            displayData={displayData}
            flexArr={flexArr}
            isFetching={isFetching}
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
