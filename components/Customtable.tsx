import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRes } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import CustomtableHead from "./table/CustomtableHead";
import CustomtableSmall from "./table/CustomtableSmall";
import CustomtableData from "./table/CustomtableData";
import { CustomTableProps } from '@/typing/tag';

const CustomTable = ({ Tabledata, Tablehead, flexArr, handleAction, actionIndex, searchQuery, showMessage }: CustomTableProps) => {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | undefined>(undefined);
  const [displayData, setDisplayData] = useState<(string | number | boolean)[][]>([]);

  const { responsive } = useRes();

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
    setDisplayData(filteredData);
  }, [filteredData]);

  const handleDialog = useCallback((action?: string, data?: string) => {
    if (handleAction) {
      handleAction(action, data);
    }
  }, [handleAction]);

  return (
    <AccessibleView name="customtable" style={{ flex: 1 }} >
      {responsive === "small" ? (
        <CustomtableSmall
          displayData={displayData}
          Tablehead={Tablehead}
          actionIndex={actionIndex}
          showMessage={showMessage}
          handleDialog={handleDialog}

        />
      ) :
        <AccessibleView name="data" style={{ flex: 1 }}>
          <CustomtableHead
            Tablehead={Tablehead}
            flexArr={flexArr}
            handleSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />

          <CustomtableData
            Tablehead={Tablehead}
            actionIndex={actionIndex}
            displayData={displayData}
            flexArr={flexArr}
            handleDialog={handleDialog}
            showMessage={showMessage}
          />

        </AccessibleView>
      }

    </AccessibleView>
  );
};

export default React.memo(CustomTable);