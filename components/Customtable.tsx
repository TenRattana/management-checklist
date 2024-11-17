import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRes } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import CustomtableHead from "./table/CustomtableHead";
import CustomtableSmall from "./table/CustomtableSmall";
import CustomtableData from "./table/CustomtableData";
import { CustomTableProps } from '@/typing/tag';
import { Selects, Text } from "@/components";
import { Picker } from "@react-native-picker/picker";
import { StyleSheet, View } from "react-native";
import useMasterdataStyles from "@/styles/common/masterdata";

const CustomTable = ({
  Tabledata,
  Tablehead,
  flexArr,
  handleAction,
  actionIndex,
  searchQuery,
  showMessage,
  selectedRows,
  setRow,
  showFilter
}: CustomTableProps) => {
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

          return Number(selectIndex) > -1 ? String(row[Number(selectIndex)]) : null
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
    setSortColumn((prev) => (prev === columnIndex ? null : columnIndex));
    setSortDirection((prev) => (prev === "ascending" ? "descending" : "ascending"));
  }, []);

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

  const dropdownOptions = useMemo(() => {
    const uniqueOptions = new Set(Tabledata.map(row => row[1]));
    return Array.from(uniqueOptions);
  }, [Tabledata]);

  const masterdataStyles = useMasterdataStyles();

  return (
    <AccessibleView name="customtable" style={{ flex: 1 }} >
      {showFilter && (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 10, marginHorizontal: 10 }}>
          <Text style={[masterdataStyles.text, { alignContent: 'center', paddingRight: 15 }]}>{Tablehead[1].label}</Text>
          <Picker
            selectedValue={filter || ""}
            onValueChange={(itemValue) => setFilter(itemValue)}
            style={styles.picker}
            mode="dropdown"
          >
            <Picker.Item label="Select an option" value="" style={styles.placeholder} />
            {dropdownOptions.map((option, index) => (
              <Picker.Item key={index} label={String(option)} value={option} />
            ))}
          </Picker>
        </View>
      )}

      {responsive === "small" ? (
        <CustomtableSmall
          displayData={displayData}
          Tablehead={Tablehead}
          actionIndex={actionIndex}
          showMessage={showMessage}
          handleDialog={handleDialog}
          selectedRows={selectedRows}
        />
      ) :
        <AccessibleView name="data" style={{ flex: 1, paddingHorizontal: 10 }}>
          <CustomtableHead
            Tablehead={Tablehead}
            flexArr={flexArr}
            handleSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            selectedRows={selectedRows}
            toggleSelectAll={toggleSelectAll}
            displayData={displayData}
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
          />

        </AccessibleView>
      }
    </AccessibleView>
  );
};

export default React.memo(CustomTable);

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 300,
    maxWidth: 400,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    width: 300
  },
  placeholder: {
    color: '#888',
  },
});