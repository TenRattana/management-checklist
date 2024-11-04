// import React from 'react'
// import AccessibleView from "@/components/AccessibleView";
// import { DataTable } from 'react-native-paper';
// import { savePaginate } from '@/app/services/storage';

// interface CustomtablePaginateProps {
//     displayData: (string | number | boolean)[][];
//     page: number;
//     itemsPerPage: number;
//     setPage: (value: React.SetStateAction<number>) => void;
//     numberOfItemsPerPageList: number[];
//     onItemsPerPageChange: (value: React.SetStateAction<number>) => void
// }

// const CustomtablePaginate: React.FC<CustomtablePaginateProps> = React.memo(({ displayData, page, itemsPerPage, setPage, numberOfItemsPerPageList, onItemsPerPageChange }) => {
//     return (
//         <AccessibleView name="container-datapaginate">
//             <DataTable.Pagination
//                 style={[{ paddingTop: 5 }]}
//                 page={page}
//                 numberOfPages={Math.ceil(displayData.length / itemsPerPage)}
//                 onPageChange={(newPage) => setPage(newPage)}
//                 label={`Page ${page + 1} of ${Math.ceil(displayData.length / itemsPerPage)}`}
//                 numberOfItemsPerPage={itemsPerPage}
//                 numberOfItemsPerPageList={numberOfItemsPerPageList}
//                 onItemsPerPageChange={(value) => {
//                     onItemsPerPageChange(value);
//                     savePaginate({ paginate: value });
//                 }}
//                 showFastPaginationControls
//                 selectPageDropdownLabel={"Rows per page"}
//             />
//         </AccessibleView>
//     )
// })

// export default CustomtablePaginate