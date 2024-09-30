// import React, { useState, useEffect } from "react";
// import { useTheme, useToast, useRes } from "../../contexts";
// import { ScrollView, View, Pressable, Text } from "react-native";
// import axios from "../../config/axios";
// import {
//   CustomTable,
//   CustomDropdown,
//   CustomDropdownMulti,
//   LoadingSpinner,
//   Searchbars,
// } from "../components";
// import { Card } from "@rneui/themed";
// import { Portal, Switch, Dialog } from "react-native-paper";
// import { Formik, Field } from "formik";
// import * as Yup from "yup";
// import screenStyles from "../../styles/screens/screen";

// interface MatchCheckListOption {
//   MCLOptionID: string;
//   GCLOptionID: string;
//   CheckListOptions: Array<{ CLOptionID: string }>;
//   IsActive: boolean;
//   GCLOptionName: string;
// }

// interface CheckListOption {
//   CLOptionID: string;
//   CLOptionName: string;
//   IsActive: boolean;
// }

// interface GroupCheckListOption {
//   GCLOptionID: string;
//   GCLOptionName: string;
//   IsActive: boolean;
// }

// interface InitialValues {
//   matchCheckListOptionId: string;
//   checkListOptionId: string[];
//   groupCheckListOptionId: string;
//   isActive: boolean;
// }

// const validationSchema = Yup.object().shape({
//   groupCheckListOptionId: Yup.string().required(
//     "This group check list field is required"
//   ),
//   checkListOptionId: Yup.array()
//     .of(Yup.string())
//     .min(1, "The check list option field requires at least one option to be selected"),
//   isActive: Yup.boolean().required("The active field is required."),
// });

// const MatchCheckListOptionScreen: React.FC = React.memo(() => {
//   const [checkListOption, setCheckListOption] = useState<CheckListOption[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);
//   const [matchCheckListOption, setMatchCheckListOption] = useState<MatchCheckListOption[]>([]);
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [isVisible, setIsVisible] = useState<boolean>(false);
//   const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
//   const [initialValues, setInitialValues] = useState<InitialValues>({
//     matchCheckListOptionId: "",
//     checkListOptionId: [],
//     groupCheckListOptionId: "",
//     isActive: true,
//   });

//   const { colors, fonts, spacing } = useTheme();
//   const { Toast } = useToast();
//   const { responsive } = useRes();
//   const styles = screenStyles({ colors, spacing, fonts, responsive });

//   const ShowMessages = (textH: string, textT: string | string[], color: string) => {
//     Toast.show({
//       type: "customToast",
//       text1: textH,
//       text2: Array.isArray(textT) ? textT.join(', ') : textT,
//       text1Style: [styles.text, { color: colors.palette.dark }],
//       text2Style: [styles.text, { color: colors.palette.dark }],
//     });
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [
//           checkListOptionResponse,
//           groupCheckListOptionResponse,
//           matchCheckListOptionResponse,
//         ] = await Promise.all([
//           axios.post("CheckListOption_service.asmx/GetCheckListOptions"),
//           axios.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions"),
//           axios.post("MatchCheckListOption_service.asmx/GetMatchCheckListOptions"),
//         ]);
        
//         setCheckListOption(checkListOptionResponse.data.data ?? []);
//         setGroupCheckListOption(groupCheckListOptionResponse.data.data ?? []);
//         setMatchCheckListOption(matchCheckListOptionResponse.data.data ?? []);
//         setIsLoading(true);
//       } catch (error) {
//         ShowMessages(
//           error.message || "Error",
//           error.response ? error.response.data.errors : ["Something went wrong!"],
//           "error"
//         );
//       }
//     };

//     fetchData();
//   }, []);

//   const saveData = async (values: InitialValues) => {
//     setIsLoadingButton(true);

//     const data = {
//       MCLOptionID: values.matchCheckListOptionId,
//       GCLOptionID: values.groupCheckListOptionId,
//       CLOptionID: JSON.stringify(values.checkListOptionId),
//       isActive: values.isActive,
//     };

//     try {
//       await axios.post("MatchCheckListOption_service.asmx/SaveMatchCheckListOption", data);
//       const response = await axios.post("MatchCheckListOption_service.asmx/GetMatchCheckListOptions");
//       setMatchCheckListOption(response.data.data ?? []);
//       setIsVisible(!response.data.status);
//     } catch (error) {
//       ShowMessages(
//         error.message || "Error",
//         error.response ? error.response.data.errors : ["Something went wrong!"],
//         "error"
//       );
//     } finally {
//       setIsLoadingButton(false);
//     }
//   };

//   const handleAction = async (action: string, item: string) => {
//     try {
//       if (action === "editIndex") {
//         const response = await axios.post("MatchCheckListOption_service.asmx/GetMatchCheckListOption", {
//           MCLOptionID: item,
//         });
        
//         const matchCheckListOption = response.data.data[0] ?? {};
//         const option = matchCheckListOption.CheckListOptions?.map((v: { CLOptionID: string }) => v.CLOptionID) || [];
        
//         setInitialValues({
//           matchCheckListOptionId: matchCheckListOption.MCLOptionID ?? "",
//           groupCheckListOptionId: matchCheckListOption.GCLOptionID ?? "",
//           checkListOptionId: option,
//           isActive: Boolean(matchCheckListOption.IsActive),
//         });

//         setIsVisible(true);
//         setIsEditing(true);
//       } else {
//         if (action === "activeIndex") {
//           await axios.post("MatchCheckListOption_service.asmx/ChangeMatchCheckListOption", {
//             MCLOptionID: item,
//           });
//         } else if (action === "delIndex") {
//           await axios.post("MatchCheckListOption_service.asmx/DeleteMatchCheckListOption", {
//             MCLOptionID: item,
//           });
//         }

//         const matchCheckListData = await axios.post("MatchCheckListOption_service.asmx/GetMatchCheckListOptions");
//         setMatchCheckListOption(matchCheckListData.data.data || []);
//       }
//     } catch (error) {
//       ShowMessages(
//         error.message || "Error",
//         error.response ? error.response.data.errors : ["Something went wrong!"],
//         "error"
//       );
//     }
//   };

//   const tableData = matchCheckListOption.flatMap((item) =>
//     item.CheckListOptions.map((option) => {
//       const matchedOption = checkListOption.find((group) => group.CLOptionID === option.CLOptionID);
//       return [
//         item.GCLOptionName,
//         matchedOption?.CLOptionName,
//         item.IsActive,
//         item.MCLOptionID,
//         item.MCLOptionID,
//       ];
//     })
//   );

//   const tableHead = ["Group Name", "Option Name", "Change Status", "Edit", "Delete"];

//   const dropcheckListOption = checkListOption.filter(
//     (v) => v.IsActive || v.CLOptionID === initialValues.checkListOptionId
//   );

//   const dropgroupCheckListOption = groupCheckListOption.filter(
//     (v) => v.IsActive || v.GCLOptionID === initialValues.groupCheckListOptionId
//   );

//   const actionIndex = [
//     {
//       editIndex: 3,
//       delIndex: 4,
//     },
//   ];

//   const customtableProps = {
//     Tabledata: tableData,
//     Tablehead: tableHead,
//     flexArr: [3, 4, 1, 1, 1],
//     actionIndex,
//     handleAction,
//     searchQuery,
//   };

//   return (
//     <View style={styles.scrollView}>
//       <ScrollView>
//         <Card>
//           <Card.Title>Create Match Group & Option</Card.Title>
//           <Card.Divider />

//           <Searchbars
//             viewProps={
//               <Pressable
//                 onPress={() => {
//                   setInitialValues({
//                     matchCheckListOptionId: "",
//                     checkListOptionId: [],
//                     groupCheckListOptionId: "",
//                     isActive: true,
//                   });
//                   setIsEditing(false);
//                   setIsVisible(true);
//                 }}
//                 style={[styles.button, styles.backMain]}
//               >
//                 <Text style={[styles.text, styles.textLight]}>
//                   Create Match Group & Option
//                 </Text>
//               </Pressable>
//             }
//             searchQuery={searchQuery}
//             handleChange={setSearchQuery}
//           />

//           {isLoading ? (
//             <CustomTable {...customtableProps} />
//           ) : (
//             <LoadingSpinner />
//           )}
//         </Card>
//       </ScrollView>

//       <Portal>
//         <Dialog
//           visible={isVisible}
//           onDismiss={() => setIsVisible(false)}
//           style={styles.containerDialog}
//           contentStyle={[styles.containerDialog]}
//         >
//           <Dialog.Title style={{ paddingLeft: 10 }}>
//             {isEditing ? "Edit Match Group & Option" : "Create Match Group & Option"}
//           </Dialog.Title>
//           <Dialog.Content>
//             <Formik
//               initialValues={initialValues}
//               validationSchema={validationSchema}
//               onSubmit={saveData}
//             >
//               {({ handleSubmit }) => (
//                 <View>
//                   <Field
//                     name="groupCheckListOptionId"
//                     component={CustomDropdown}
//                     placeholder="Group Check List Option"
//                     data={dropgroupCheckListOption}
//                     field="GCLOptionID"
//                     value={initialValues.groupCheckListOptionId}
//                     onChangeValue={(value:any) => setInitialValues((prev) => ({
//                       ...prev,
//                       groupCheckListOptionId: value,
//                     }))}
//                   />

//                   <Field
//                     name="checkListOptionId"
//                     component={CustomDropdownMulti}
//                     placeholder="Check List Option"
//                     data={dropcheckListOption}
//                     field="CLOptionID"
//                     value={initialValues.checkListOptionId}
//                     onChangeValue={(value) => setInitialValues((prev) => ({
//                       ...prev,
//                       checkListOptionId: value,
//                     }))}
//                   />

//                   <Field
//                     name="isActive"
//                     component={Switch}
//                     label="Is Active"
//                     value={initialValues.isActive}
//                     onValueChange={(value) => setInitialValues((prev) => ({
//                       ...prev,
//                       isActive: value,
//                     }))}
//                   />
//                 </View>
//               )}
//             </Formik>
//           </Dialog.Content>
//           <Dialog.Actions>
//             <Pressable onPress={() => setIsVisible(false)} style={styles.button}>
//               <Text style={styles.textLight}>Cancel</Text>
//             </Pressable>
//             <Pressable onPress={handleSubmit} style={styles.button}>
//               <Text style={styles.textLight}>
//                 {isLoadingButton ? "Saving..." : "Save"}
//               </Text>
//             </Pressable>
//           </Dialog.Actions>
//         </Dialog>
//       </Portal>
//     </View>
//   );
// });

// export default MatchCheckListOptionScreen;
