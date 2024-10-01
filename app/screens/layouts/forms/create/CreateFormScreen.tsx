// import React, { useState, useCallback, useRef } from "react";
// import {
//     addSubForm,
//     updateSubForm,
//     deleteSubForm,
//     addField,
//     updateField,
//     deleteField,
//     setSubForm,
//     setField,
// } from "@/slices";
// import { View, Pressable, Text } from "react-native";
// import { useFormBuilder } from "@/customhooks";
// import axios from "../../../config/axios";
// import {
//     Layout2,
//     FormDialog,
//     SaveFormDialog,
//     SubFormDialog,
//     FieldDialog,
// } from "../../components";
// import formStyles from "../../../styles/forms/form";
// import { useTheme, useToast, useRes } from "../../../contexts";
// import * as Yup from "yup";
// import { Entypo, AntDesign } from "@expo/vector-icons";
// import DraggableFlatList, {
//     ScaleDecorator,
// } from "react-native-draggable-flatlist";
// import { IconButton } from "react-native-paper";
// import { GestureHandlerRootView } from "react-native-gesture-handler";

// const FormBuilder = React.memo(({ route }) => {
//     const {
//         form,
//         setForm,
//         checkList,
//         checkListType,
//         groupCheckListOption,
//         dataType,
//         formData,
//         state,
//         dispatch,
//         ShowMessages,
//     } = useFormBuilder(route);

//     const validationSchemaField = Yup.object().shape({
//         checkListId: Yup.string().required("Check List is required."),
//         checkListTypeId: Yup.string().required("Check List Type is required."),
//         placeholder: Yup.string().nullable(),
//         hint: Yup.string().nullable(),
//     });

//     const [formValues, setFormValues] = useState({});
//     const [showDialogs, setShowDialogs] = useState({
//         form: false,
//         subForm: false,
//         field: false,
//         save: false,
//     });
//     const [subForm, setSubInForm] = useState({
//         subFormId: "",
//         subFormName: "",
//         formId: "",
//         columns: "",
//         displayOrder: "",
//     });
//     const [formState, setFormState] = useState({
//         checkListId: "",
//         groupCheckListOptionId: "",
//         checkListTypeId: "",
//         dataTypeId: "",
//         dataTypeValue: "",
//         subFormId: "",
//         require: false,
//         minLength: "",
//         maxLength: "",
//         description: "",
//         placeholder: "",
//         hint: "",
//         displayOrder: "",
//     });
//     const [count, setCount] = useState(0);
//     const [editMode, setEditMode] = useState(false);
//     const { colors, spacing, fonts } = useTheme();
//     const { responsive } = useRes();
//     const styles = formStyles({ colors, spacing, fonts, responsive });

//     const saveForm = useCallback(async () => {
//         const data = {
//             SubFormData: JSON.stringify(state.subForms),
//             FormData: JSON.stringify(form),
//         };

//         try {
//             await axios.post("MatchCheckList_service.asmx/SaveFormCheckList", data);
//         } catch (error) {
//             ShowMessages(
//                 error.message || "Error",
//                 error.response ? error.response.data.errors : ["Something went wrong!"],
//                 "error"
//             );
//         } finally {
//             setShowDialogs({
//                 form: false,
//                 subForm: false,
//                 field: false,
//                 save: false,
//             });
//         }
//     }, [form, state.subForms]);

//     const saveSubForm = useCallback((values, option) => {
//         const payload = { subForm: values };

//         try {
//             if (option === "add") {
//                 dispatch(addSubForm(payload));
//             } else if (option === "update") {
//                 dispatch(updateSubForm(payload));
//             }
//         } catch (error) {
//             ShowMessages(
//                 error.message || "Error",
//                 error.response?.data?.errors || ["Something went wrong!"],
//                 "error"
//             );
//         } finally {
//             setShowDialogs({
//                 form: false,
//                 subForm: false,
//                 field: false,
//                 save: false,
//             });
//         }
//     }, []);

//     const saveField = useCallback(
//         (values, option) => {
//             const defaultDTypeID = dataType.find(
//                 (v) => v.DTypeName === "String"
//             )?.DTypeID;
//             values.dataTypeId = values.dataTypeId || defaultDTypeID;
//             const payload = {
//                 formState: values,
//                 checkList,
//                 checkListType,
//                 dataType,
//             };

//             try {
//                 if (option === "add") {
//                     dispatch(addField(payload));
//                 } else if (option === "update") {
//                     dispatch(updateField(payload));
//                 }
//             } catch (error) {
//                 ShowMessages(
//                     error.message || "Error",
//                     error.response?.data?.errors || ["Something went wrong!"],
//                     "error"
//                 );
//             } finally {
//                 setCount(count + 1);
//                 setShowDialogs((prev) => ({ ...prev, field: false }));
//             }
//         },
//         [dataType, checkListType, checkList]
//     );

//     const onDelete = useCallback((values) => {
//         try {
//             dispatch(deleteSubForm({ values }));
//         } catch (error) {
//             ShowMessages(
//                 error.message || "Error",
//                 error.response?.data?.errors || ["Something went wrong!"],
//                 "error"
//             );
//         } finally {
//             setShowDialogs({
//                 subForm: false,
//                 field: false,
//                 save: false,
//             });
//         }
//     }, []);

//     const onDeleteField = useCallback((subFormId, field) => {
//         try {
//             dispatch(deleteField({ subFormId, field }));
//         } catch (error) {
//             ShowMessages(
//                 error.message || "Error",
//                 error.response?.data?.errors || ["Something went wrong!"],
//                 "error"
//             );
//         } finally {
//             setCount(count + 1);
//             setShowDialogs({
//                 subForm: false,
//                 field: false,
//                 save: false,
//             });
//         }
//     }, []);

//     const renderField = ({ item, drag, isActive }) => (
//         <Pressable
//             onPress={() => {
//                 setEditMode(true);
//                 setFormState(item);
//                 setShowDialogs((prev) => ({ ...prev, field: true }));
//             }}
//             onLongPress={drag}
//             disabled={isActive}
//             style={[
//                 styles.button,
//                 isActive ? styles.backDis : styles.backLight,
//                 {
//                     flexDirection: "row",
//                     justifyContent: "flex-start",
//                     alignItems: "center",
//                 },
//             ]}
//             key={item.checkListId}
//         >
//             <IconButton
//                 style={styles.icon}
//                 color={colors.dark}
//                 icon={
//                     checkListType.find((v) => v.CTypeID === item.checkListTypeId)?.icon ||
//                     ""
//                 }
//                 size={20}
//             />
//             <Text style={[styles.text, styles.textDark, { paddingLeft: 15 }]}>
//                 {item.CheckListName}
//             </Text>
//         </Pressable>
//     );

//     const renderSubForm = ({ item, drag, isActive }) => (
//         <View style={{ marginTop: 30 }}>
//             <Pressable
//                 onPress={() => {
//                     setSubInForm(item);
//                     setShowDialogs((prev) => ({ ...prev, subForm: true }));
//                     setEditMode(true);
//                 }}
//                 onLongPress={drag}
//                 disabled={isActive}
//                 style={[
//                     styles.button,
//                     isActive ? styles.backLight : styles.backSucceass,
//                     {
//                         flexDirection: "row",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                     },
//                 ]}
//                 key={item.subFormId}
//             >
//                 <Text
//                     style={[
//                         styles.text,
//                         isActive ? styles.textDark : styles.textLight,
//                         { paddingLeft: 15 },
//                     ]}
//                 >
//                     Sub Form: {item.subFormName}
//                 </Text>
//                 <Entypo
//                     name="chevron-right"
//                     size={18}
//                     color={colors.palette.light}
//                     style={{ paddingRight: 15 }}
//                 />
//             </Pressable>

//             <DraggableFlatList
//                 activationDistance={1}
//                 data={item.fields}
//                 renderItem={renderField}
//                 keyExtractor={(field, fieldIndex) =>
//                     `${field.checkListId}-${fieldIndex}`
//                 }
//                 onDragEnd={({ data }) => {
//                     let updatedSubForms = [];
//                     state.subForms.forEach((subForm) => {
//                         if (subForm.subFormId === item.subFormId) {
//                             updatedSubForms.push(...data);
//                         } else {
//                             updatedSubForms.push(...subForm.fields);
//                         }
//                     });
//                     dispatch(
//                         setField({ formState: updatedSubForms, checkList, checkListType })
//                     );
//                 }}
//             />

//             <Pressable
//                 onPress={() => {
//                     setEditMode(false);
//                     const uniqueMatchCheckListId = `field-${count}`;
//                     setFormState({
//                         checkListId: "",
//                         groupCheckListOptionId: "",
//                         checkListTypeId: "",
//                         dataTypeId: "",
//                         dataTypeValue: "",
//                         require: false,
//                         minLength: "",
//                         maxLength: "",
//                         description: "",
//                         placeholder: "",
//                         hint: "",
//                         displayOrder: "",
//                         icon: "",
//                         subFormId: item.subFormId,
//                         matchCheckListId: uniqueMatchCheckListId,
//                     });
//                     setShowDialogs((prev) => ({ ...prev, field: true }));
//                 }}
//                 style={[
//                     styles.button,
//                     styles.backLight,
//                     { flexDirection: "row", alignItems: "center" },
//                 ]}
//             >
//                 <Text style={[styles.text, styles.textDark, { paddingLeft: 15 }]}>
//                     <AntDesign name="plus" size={16} color={colors.palette.blue} />
//                     Add Field
//                 </Text>
//             </Pressable>
//         </View>
//     );

//     return (
//         <GestureHandlerRootView>
//             <View style={styles.container}>
//                 <View style={styles.layout1}>
//                     <Pressable
//                         onPress={() => {
//                             setEditMode(false);
//                             setShowDialogs((prev) => ({ ...prev, subForm: true }));
//                             setSubInForm({
//                                 subFormId: "",
//                                 subFormName: "",
//                                 formId: "",
//                                 columns: "",
//                                 displayOrder: "",
//                                 machineId: "",
//                             });
//                         }}
//                         style={[
//                             styles.button,
//                             styles.backSucceass,
//                             { flexDirection: "row", alignItems: "center" },
//                         ]}
//                     >
//                         <AntDesign name="plus" size={16} color={colors.palette.blue} />
//                         <Text style={[styles.text, styles.textLight, { marginLeft: 5 }]}>
//                             Add Sub Form
//                         </Text>
//                     </Pressable>

//                     <DraggableFlatList
//                         data={state.subForms}
//                         activationDistance={1}
//                         style={{ flexGrow: 0 }}
//                         renderItem={renderSubForm}
//                         keyExtractor={(item, index) => `subForm-${index}`}
//                         onDragEnd={({ data }) => dispatch(setSubForm({ subForms: data }))}
//                         contentContainerStyle={styles.contentContainer}
//                         showsVerticalScrollIndicator={false}
//                         nestedScrollEnabled={true}
//                     />

//                     <Pressable
//                         onPress={() => {
//                             setShowDialogs((prev) => ({ ...prev, form: true }));
//                             setForm(form);
//                         }}
//                         style={[
//                             styles.button,
//                             styles.backSucceass,
//                             {
//                                 flexDirection: "row",
//                                 justifyContent: "space-between",
//                                 alignItems: "center",
//                             },
//                         ]}
//                     >
//                         <Text style={[styles.text, styles.textLight, { paddingLeft: 15 }]}>
//                             Header
//                         </Text>
//                         <Entypo
//                             name="chevron-right"
//                             size={18}
//                             color={colors.palette.light}
//                             style={{ paddingRight: 15 }}
//                         />
//                     </Pressable>

//                     <Pressable
//                         onPress={() => setShowDialogs((prev) => ({ ...prev, save: true }))}
//                         style={[styles.button, styles.backSucceass]}
//                     >
//                         <Text style={[styles.text, styles.textLight]}>Save Form</Text>
//                     </Pressable>
//                 </View>

//                 <FormDialog
//                     form={form}
//                     isVisible={showDialogs.form}
//                     styles={styles}
//                     setShowDialogs={() =>
//                         setShowDialogs((prev) => ({ ...prev, form: false }))
//                     }
//                     setForm={setForm}
//                     responsive={responsive}
//                 />

//                 <SaveFormDialog
//                     isVisible={showDialogs.save}
//                     setShowDialogs={() =>
//                         setShowDialogs((prev) => ({ ...prev, save: false }))
//                     }
//                     styles={styles}
//                     saveForm={saveForm}
//                     responsive={responsive}
//                 />

//                 <SubFormDialog
//                     isVisible={showDialogs.subForm}
//                     setShowDialogs={() =>
//                         setShowDialogs((prev) => ({ ...prev, subForm: false }))
//                     }
//                     editMode={editMode}
//                     styles={styles}
//                     subForm={subForm}
//                     onDelete={onDelete}
//                     saveSubForm={saveSubForm}
//                 />
//                 <FieldDialog
//                     isVisible={showDialogs.field}
//                     setShowDialogs={() =>
//                         setShowDialogs((prev) => ({ ...prev, field: false }))
//                     }
//                     validationSchemaField={validationSchemaField}
//                     editMode={editMode}
//                     style={{ styles, colors, spacing }}
//                     formState={formState}
//                     saveField={saveField}
//                     checkList={checkList}
//                     checkListType={checkListType}
//                     dataType={dataType}
//                     responsive={responsive}
//                     onDeleteField={onDeleteField}
//                     groupCheckListOption={groupCheckListOption}
//                 />
//                 <View style={styles.layout2}>
//                     <Layout2
//                         form={form}
//                         style={{ styles, spacing, fonts, colors, responsive }}
//                         state={state}
//                         checkListType={checkListType}
//                         checkList={checkList}
//                         formData={formData}
//                         groupCheckListOption={groupCheckListOption}
//                         ShowMessages={ShowMessages}
//                         setFormValues={setFormValues}
//                         formValues={formValues}
//                     />
//                 </View>
//             </View>
//         </GestureHandlerRootView>
//     );
// });

// export default FormBuilder;
