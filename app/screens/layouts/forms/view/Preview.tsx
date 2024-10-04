// import React, { useEffect, useState, useCallback } from "react";
// import { ScrollView, View, Text } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     LoadingSpinner,
//     Inputs,
//     Radios,
//     Checkboxs,
//     Textareas,
//     Selects,
//     AccessibleView,
// } from "@/components";
// import axios from "axios";
// import axiosInstance from "@/config/axios";
// import { setSubForm, setField, reset } from "@/slices";
// import { useToast, useTheme, useRes } from "@/app/contexts";
// import { useFocusEffect } from "@react-navigation/native";
// import useMasterdataStyles from "@/styles/common/masterdata";
// import { Divider } from "react-native-paper";
// import useForm from '@/hooks/custom/useForm';
// import { BaseFormState, BaseSubForm } from '@/typing/form'

// interface PreviewProps {
//     route: any
// }

// const Preview = ({ route }: any) => {
//     const { formId, tableId } = route.params || {};
//     const {
//         state,
//         isLoading,
//         dispatch,
//         fetchData
//     } = useForm(route);
//     const [formValues, setFormValues] = useState<Record<string, any>>({});

//     const masterdataStyles = useMasterdataStyles();
//     const { showError } = useToast();
//     const { spacing } = useRes();

//     const errorMessage = useCallback((error: unknown) => {
//         let errorMessage: string | string[];

//         if (axios.isAxiosError(error)) {
//             errorMessage = error.response?.data?.errors ?? ["Something went wrong!"];
//         } else if (error instanceof Error) {
//             errorMessage = [error.message];
//         } else {
//             errorMessage = ["An unknown error occurred!"];
//         }

//         showError(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
//     }, [showError]);

//     useEffect(() => {
//         fetchData();
//     }, [formId]);

//     const handleChange = (fieldName: string, value: string) => {
//         setFormValues((prev) => ({
//             ...prev,
//             [fieldName]: value,
//         }));
//     };

//     const renderField = (field: BaseFormState) => {
//         const fieldName = field.MCListID;
//         console.log(field);

//         switch (field.CTypeName) {
//             case "Textinput":
//                 return (
//                     <Inputs
//                         placeholder={field.Placeholder}
//                         hint={field.Hint}
//                         label={field.CListName}
//                         value={formValues[fieldName] || ""}
//                         handleChange={(value) => handleChange(fieldName, value)}
//                     />
//                 );
//             case "Textarea":
//                 return (
//                     <Textareas
//                         placeholder={field.Placeholder}
//                         hint={field.Hint}
//                         label={field.CListName}
//                         value={formValues[fieldName] || ""}
//                         handleChange={(value) => handleChange(fieldName, value)}
//                     />
//                 );
//             case "Dropdown":
//                 const options = groupCheckListOption
//                     ?.find((opt) => opt.GCLOptionID === field.GCLOptionID)
//                     ?.CheckListOptions.map((item) => ({
//                         label: item.CLOptionName,
//                         value: item.CLOptionID,
//                     }));
//                 return (
//                     <Selects
//                         option={options}
//                         hint={field.Hint}
//                         label={field.CheckListName}
//                         value={formValues[fieldName] || ""}
//                         handleChange={(value) => handleChange(fieldName, value)}
//                     />
//                 );
//             case "Radio":
//                 const radioOptions = groupCheckListOption
//                     ?.find((opt) => opt.GCLOptionID === field.GCLOptionID)
//                     ?.CheckListOptions.map((item) => ({
//                         label: item.CLOptionName,
//                         value: item.CLOptionID,
//                     }));
//                 return (
//                     <Radios
//                         option={radioOptions}
//                         hint={field.Hint}
//                         label={field.CheckListName}
//                         value={formValues[fieldName] || ""}
//                         handleChange={(value) => handleChange(fieldName, value)}
//                     />
//                 );
//             case "Checkbox":
//                 const checkboxOptions = groupCheckListOption
//                     ?.find((opt) => opt.GCLOptionID === field.GCLOptionID)
//                     ?.CheckListOptions.map((item) => ({
//                         label: item.CLOptionName,
//                         value: item.CLOptionID,
//                     }));
//                 return (
//                     <Checkboxs
//                         option={checkboxOptions}
//                         hint={field.Hint}
//                         label={field.CheckListName}
//                         value={formValues[fieldName] || ""}
//                         handleChange={(value) => handleChange(fieldName, value)}
//                     />
//                 );
//             default:
//                 return null;
//         }
//     };
//     console.log(state);

//     return (
//         <ScrollView
//             contentContainerStyle={{
//                 flexGrow: 1,
//             }}
//         >
//             {isLoading ? (
//                 <LoadingSpinner />
//             ) : (
//                 <>
//                     <AccessibleView>
//                         <Text>{state.FormName}</Text>
//                         <Text>{state.Description}</Text>
//                     </AccessibleView>
//                     {state.subForms.map((subForm: BaseSubForm) => (
//                         <View key={subForm.SFormName}>
//                             <Divider />
//                             <AccessibleView>
//                                 <Text>{subForm.SFormName}</Text>
//                             </AccessibleView>
//                             <View style={{ flexDirection: "row" }}>
//                                 {subForm.Fields?.map((field) => (
//                                     <View
//                                         key={field.MCListID}
//                                         style={{ flex: 1 / subForm.Columns }}
//                                     >
//                                         {renderField(field)}
//                                     </View>
//                                 ))}
//                             </View>
//                         </View>
//                     ))}
//                 </>
//             )}
//         </ScrollView>
//     );
// };

// export default React.memo(Preview);
