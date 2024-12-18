import React, { useState, useEffect } from 'react';
import { View, Platform, Text } from 'react-native';
import { useInfiniteQuery } from 'react-query';
import { fetchMachineGroups, fetchSearchMachineGroups } from '../services';
import Dropdown from '../../components/common/Dropdown';
import { TouchableOpacity } from 'react-native-gesture-handler';

const MyComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const { data, isFetching, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery(
    ['machineGroups', debouncedSearchQuery],
    ({ pageParam = 0 }) => {
      return debouncedSearchQuery
        ? fetchSearchMachineGroups(debouncedSearchQuery)
        : fetchMachineGroups(pageParam, 100);
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
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
          const newItemsSet = new Set(prevItems.map((item: any) => item.value));
          const mergedItems = prevItems.concat(
            newItems.filter((item) => !newItemsSet.has(item.value))
          );
          return mergedItems;
        });
      },
    }
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    if (searchQuery === '') {
      refetch();
    }
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setItems([]);
  };

  const handleScroll = ({ nativeEvent }: any) => {
    if (nativeEvent && nativeEvent.contentSize) {
      const contentHeight = nativeEvent.contentSize.height;
      const layoutHeight = nativeEvent.layoutMeasurement.height;
      const offsetY = nativeEvent.contentOffset.y;

      if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPage && !isFetching) {
        fetchNextPage();
      }
    }
  };

  return (
    <View style={{ marginHorizontal: 10, ...(Platform.OS !== 'android' && { zIndex: 10 }) }}>
      <Dropdown
        label='group machine'
        selectedValue={selectedValue}
        items={items}
        searchQuery={searchQuery}
        setSelectedValue={(value: string) => setSelectedValue(value)}
        isFetching={isFetching}
        handleSearch={handleSearch}
        fetchNextPage={fetchNextPage}
        handleScroll={handleScroll}
      />
    </View>
  );
};

export default MyComponent;
