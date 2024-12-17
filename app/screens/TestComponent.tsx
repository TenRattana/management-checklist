import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useInfiniteQuery } from 'react-query';
import { fetchMachineGroups, fetchSearchMachineGroups } from '../services';

const InfiniteDropdown = () => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

  const {
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ['machineGroup', debouncedSearchQuery],
    ({ pageParam = 0 }) => {
      return debouncedSearchQuery
        ? fetchSearchMachineGroups(debouncedSearchQuery)
        : fetchMachineGroups(pageParam, 100);
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 100 ? allPages.length : undefined;
      },
      enabled: true,
      onSuccess: (newData) => {
        const newItems = newData.pages.flat().map((item) => ({
          label: item.GMachineName || 'Unknown',
          value: item.GMachineID || '',
        }));

        setItems((prevItems) => {
          const newItemsSet = new Set(prevItems.map(item => item.value));
          newData.pages.flat().forEach(item => {
            if (!newItemsSet.has(item.GMachineID)) {
              newItemsSet.add(item.GMachineID);
              prevItems.push({ label: item.GMachineName || 'Unknown', value: item.GMachineID });
            }
          });
          return [...prevItems];
        });
      },
    }
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setItems([]); 
  };

  const handleScroll = (event: any) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    const offsetY = event.nativeEvent.contentOffset.y;

    // ตรวจสอบว่าเราสามารถดึงข้อมูลต่อไปได้หรือไม่
    if (
      contentHeight - layoutHeight - offsetY <= 0 && // ตรวจสอบว่าเราอยู่ที่จุดล่างสุดของ scroll
      hasNextPage && // ตรวจสอบว่า `hasNextPage` เป็น `true`
      !isFetching // ตรวจสอบว่าไม่มีการ `fetch` อยู่
    ) {
      fetchNextPage();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Machine Group</Text>

      <DropDownPicker
        mode="SIMPLE"
        maxHeight={300}
        setOpen={() => {}}
        open={open}
        value={selectedValue}
        items={items}
        setValue={setSelectedValue}
        placeholder="Search for a machine group..."
        containerStyle={styles.dropdownContainer}
        loading={isFetching}
        style={styles.dropDownStyle}
        listMode="SCROLLVIEW"
        searchable={true}
        searchPlaceholder="Search for a machine group..."
        onChangeSearchText={handleSearch}
        scrollViewProps={{
          onScroll: handleScroll,
        }}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        searchTextInputStyle={styles.searchInput}  // เพิ่มสไตล์ให้กับช่องค้นหา
      />

      {isFetching && items.length > 0 && (
        <ActivityIndicator size="small" color="#007bff" style={styles.loader} />
      )}

      {items.length === 0 && !isFetching && (
        <Text style={styles.noResultsText}>No results found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: '#f5f5f5',  // เพิ่มสีพื้นหลังให้กับ container
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#333',  // สีของข้อความ title
      textAlign: 'center',  // จัดข้อความให้อยู่กลาง
    },
    loader: {
      marginTop: 10,
    },
    dropdownContainer: {
      width: '100%',
      marginBottom: 20,  // เพิ่มระยะห่างด้านล่าง
    },
    dropDownStyle: {
      backgroundColor: 'white',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ddd',
      paddingHorizontal: 10,  // เพิ่ม padding ด้านใน
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',  // ใช้ boxShadow แทน shadow properties
      elevation: 3,  // เพิ่มเงาให้กับ Android
    },
    searchInput: {
      backgroundColor: '#f9f9f9',  // เพิ่มสีพื้นหลังให้ช่องค้นหา
      borderRadius: 8,  // ทำให้มุมของช่องค้นหานุ่มนวล
      borderWidth: 1,
      borderColor: '#ddd',
      paddingLeft: 10,
      height: 40,  // เพิ่มความสูงให้ช่องค้นหา
      fontSize: 16,  // ขยายขนาดตัวอักษรให้ใหญ่ขึ้น
    },
    noResultsText: {
      fontSize: 16,
      color: '#888',
      textAlign: 'center',
      marginTop: 20,  // เพิ่มระยะห่างด้านบน
    },
  });
  

export default InfiniteDropdown;
