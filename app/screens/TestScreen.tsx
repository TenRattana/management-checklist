import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView } from 'react-native';
import { Formik, useField } from 'formik';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Yup from 'yup'

interface CustomInputProps {
  label: string;
  name: string;
  value: string;
}

const data = [
  { label: 'Item 1', value: '1' },
  { label: 'Item 2', value: '2' },
  { label: 'Item 3', value: '3' },
  { label: 'Item 4', value: '4' },
  { label: 'Item 5', value: '5' },
  { label: 'Item 6', value: '6' },
  { label: 'Item 7', value: '7' },
  { label: 'Item 8', value: '8' },
];

const CustomInput: React.FC<CustomInputProps> = React.memo(({ label, name, value }) => {
  const [field, meta, { setTouched, setValue }] = useField(name);

  return (
    <View>
      <Text>{label}</Text>
      <TextInput
        {...field}
        style={{
          borderColor: meta.touched && meta.error ? 'red' : 'gray',
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
        }}
        onChangeText={value => setValue(value)}
        onBlur={() => setTouched(true)}
        value={value}
      />
      {meta.touched && meta.error ? (
        <Text style={{ color: 'red' }}>{meta.error}</Text>
      ) : null}
    </View>
  );
});

const CustomDropdown: React.FC<{ name: string; data: { label: string; value: string }[] }> = React.memo(({ name, data }) => {
  const [field, meta, helpers] = useField(name);

  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder="Select item"
      searchPlaceholder="Search..."
      value={field.value}
      onChange={item => {
        helpers.setValue(item.value);
      }}
      renderLeftIcon={() => (
        <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
      )}
    />
  );
});

const validationSchemaField = Yup.object().shape({
  CListID: Yup.string().required("The checklist field is required."),
  CTypeID: Yup.string().required("The checklist type field is required."),
  Placeholder: Yup.string().nullable(),
  Hint: Yup.string().nullable(),
  Required: Yup.boolean().required("The required field is required."),
});

const MyForm: React.FC = () => (
  <Formik
    initialValues={{ Placeholder: '', Hint: '' }}
    validationSchema={validationSchemaField}
    onSubmit={values => console.log(values)}
  >
    {({ handleSubmit }) => (
      <ScrollView>
        {["Placeholder", "Hint"].map((name, index) => {
          const [field, meta, { setTouched, setValue }] = useField(name);
          return (
            <CustomInput label={field.name} name={field.name} key={`${name}-${index}`} value={field.value} onChange={(value) => setValue(value)} onBlur={() => setTouched(true)} />
          )
        })}
        <Button onPress={() => handleSubmit()} title="Submit" />
      </ScrollView>
    )}
  </Formik>

  // <Formik
  //   initialValues={{ input1: '', input2: '', dropdown: '' }}
  //   onSubmit={(values) => {
  //     console.log(values);
  //   }}
  // >
  //   {({ handleSubmit }) => (
  //     <View>
  //       <CustomInput label="Input 1" name="input1" />
  //       <CustomInput label="Input 2" name="input2" />
  //       <CustomDropdown name="dropdown" data={data} />
  //       <Button onPress={() => handleSubmit()} title="Submit" />
  //     </View>
  //   )}
  // </Formik>
);

export default MyForm;

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

// import React from 'react';
// import { View, Button, StyleSheet } from 'react-native';
// import { Formik } from 'formik';
// import { CustomDropdown, CustomInput } from './cm'

// const data = [
//   { label: 'Item 1', value: '1' },
//   { label: 'Item 2', value: '2' },
//   { label: 'Item 3', value: '3' },
//   { label: 'Item 4', value: '4' },
//   { label: 'Item 5', value: '5' },
//   { label: 'Item 6', value: '6' },
//   { label: 'Item 7', value: '7' },
//   { label: 'Item 8', value: '8' },
// ];

// const MyForm: React.FC = () => (
//   <View>
//     <CustomInput label="Input 1" name="input1" />
//     <CustomInput label="Input 2" name="input2" />
//     <CustomDropdown name="dropdown" data={data} />
//   </View>
// );

// export default MyForm;

// const styles = StyleSheet.create({
//   dropdown: {
//     margin: 16,
//     height: 50,
//     borderBottomColor: 'gray',
//     borderBottomWidth: 0.5,
//   },
//   icon: {
//     marginRight: 5,
//   },
//   placeholderStyle: {
//     fontSize: 16,
//   },
//   selectedTextStyle: {
//     fontSize: 16,
//   },
//   iconStyle: {
//     width: 20,
//     height: 20,
//   },
//   inputSearchStyle: {
//     height: 40,
//     fontSize: 16,
//   },
// });
