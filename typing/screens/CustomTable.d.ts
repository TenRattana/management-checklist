import { DebouncedFunc } from "lodash";
import { ActionProps, CellProps, HandelPrssProps } from "../tag";
import { TypeConfig } from "../type";

export interface RenderItemHeadProps {
  Tablehead: { label?: string; align?: string }[];
  flexArr: number[];
  handleSort: (index: number) => void;
  sortColumn: number | null;
  sortDirection: "ascending" | "descending" | undefined;
  selectedRows?: string[];
  toggleSelectAll?: () => void;
  displayData: (string | number | boolean)[][];
  showFilter?: boolean;
  filter?: string | null;
  handelSetFilter: DebouncedFunc<(value: string | null) => void>;
  showData?: TypeConfig[];
  showColumn?: string;
  handleDialog: (action?: string, data?: string) => void;
  ShowTitle?: string;
  showFilterDate?: boolean;
  filteredDate: DebouncedFunc<(value: string | null) => void>;
  Dates?: string | null;
  handleLoadMore?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  handlefilter?: (value?: string) => void;
  searchfilter?: string;
}

export interface RenderItemSmallProps {
  item: (string | number | boolean)[];
  index: number;
  Tablehead: { label?: string; align?: string }[];
  actionIndex: { [key: string]: string | number }[];
  detail: boolean | undefined;
  detailKey: string | undefined;
  detailData: any[] | undefined;
  detailKeyrow: number | undefined;
  showMessage: number;
  showDetailwithKey: string[] | undefined;
  selectedRows: string[] | undefined;
  toggleSelect: (value: string) => void;
  setDialogState: React.Dispatch<
    React.SetStateAction<{
      isVisible: boolean;
      action: string;
      message: string;
      title: string;
      data: string;
    }>
  >;
}

export interface RenderItemHeadSmallProps {
    selectedRows?: string[], 
    handleDialog: (action?: string, data?: string) => void, 
    showFilterDate?: boolean, 
    Dates?: string | null, 
    filteredDate: DebouncedFunc<(value: string | null) => void>, 
    showFilter?: boolean, 
    ShowTitle?: string,
    filter?: string | null, handlefilter?: (value?: string) => void, 
    searchfilter?: string, handleLoadMore?: (() => void), 
    hasNextPage?: boolean, 
    isFetchingNextPage?: boolean, 
    showData?: any[], 
    handelSetFilter: DebouncedFunc<(value: string | null) => void>
}

export interface RenderItemProps {
  item: (string | number | boolean)[];
  index: number;
  Tablehead: { label?: string; align?: string }[];
  flexArr: number[];
  actionIndex: { [key: string]: string | number }[];
  showMessage: number;
  selectedRows: string[] | undefined;
  toggleSelect: (value: string) => void;
  detail: boolean | undefined;
  detailKey: string | undefined;
  detailData: any[] | undefined;
  detailKeyrow: number | undefined;
  showDetailwithKey: string[] | undefined;
  setDialogState: React.Dispatch<
    React.SetStateAction<{
      isVisible: boolean;
      action: string;
      message: string;
      title: string;
      data: string;
    }>
  >;
}

export type DetailContentProps = {
    detailData: any[];
    showDetailwithKey?: string[];
};

export interface CellcontentProps extends CellProps {
    handlePress: (props: HandelPrssProps) => void
}

export interface ActioncontentProps extends ActionProps {
    handlePress: (props: HandelPrssProps) => void
    selectedRows?: string[];
    toggleSelect?: (value: string) => void;
}

export interface CustomtableDataProps {
  actionIndex: { [key: string]: number | string }[];
  flexArr: number[];
  Tablehead: { label?: string; align?: string }[];
  displayData: (string | number | boolean)[][];
  handleDialog: (action?: string, data?: string) => void;
  showMessage: number;
  selectedRows?: string[];
  toggleSelect: (value: string) => void;
  detail?: boolean;
  detailKey?: string;
  detailKeyrow?: number;
  showDetailwithKey?: string[];
  detailData?: TypeConfig[];
  handlePaginationChange?: () => void;
  isFetching?: boolean;
}

export interface CustomtableSmallProps {
  displayData: (string | number | boolean)[][];
  Tablehead: { label?: string; align?: string }[];
  actionIndex: { [key: string]: number }[];
  showMessage: number | any;
  handleDialog: (action?: string, data?: string) => void;
  selectedRows?: string[];
  showFilter?: boolean;
  filter?: string | null;
  handelSetFilter: DebouncedFunc<(value: string | null) => void>;
  showData?: TypeConfig[];
  showColumn?: string;
  handleDialog: (action?: string, data?: string) => void;
  toggleSelect: (value: string) => void;
  detail?: boolean;
  detailKey?: string;
  detailKeyrow?: number;
  showDetailwithKey?: string[];
  detailData?: TypeConfig[];
  ShowTitle?: string;
  handlePaginationChange?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  showFilterDate?: boolean;
  setFilterDate?: number;
  handlefilter?: (value?: string) => void;
  handleLoadMore?: () => void;
  searchfilter?: string;
  isFetching?: boolean;
  filteredDate: DebouncedFunc<(value: string | null) => void>;
  Dates?: string | null;
}

export interface CustomTableProps {
  Tabledata: (string | number | boolean)[][];
  Tablehead: { label?: string; align?: string }[];
  flexArr: number[];
  handleAction?: (action?: string, data?: string) => void;
  actionIndex: { [key: string]: number }[];
  searchQuery: string;
  showMessage: number | Array;
  selectedRows?: string[];
  setRow?: (value: string[]) => void;
  showFilter?: boolean;
  showData?: TypeConfig[];
  showColumn?: string;
  filterColumn?: number;
  detail?: boolean;
  detailKey?: string;
  showDetailwithKey?: string[];
  detailKeyrow?: number;
  detailData?: TypeConfig[];
  ShowTitle?: string;
  handlePaginationChange?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  showFilterDate?: boolean;
  setFilterDate?: number;
  handlefilter?: (value?: string) => void;
  searchfilter?: string;
  isFetching?: boolean;
}