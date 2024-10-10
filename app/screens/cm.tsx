
import React from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Field } from 'formik';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';

interface CustomInputProps {
    label: string;
    name: string;
}

export const CustomInput: React.FC<CustomInputProps> = React.memo(({ label, name }) => (
    <Field name={name}>
        {({ field, meta }: any) => (
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
                    onChangeText={field.onChange(name)}
                    value={field.value}
                />
                {meta.touched && meta.error ? (
                    <Text style={{ color: 'red' }}>{meta.error}</Text>
                ) : null}
            </View>
        )}
    </Field>
));

export const CustomDropdown: React.FC<{ name: string; data: { label: string; value: string }[] }> = React.memo(({ name, data }) => (
    <Field name={name}>
        {({ field, form }: any) => (
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
                    form.setFieldValue(name, item.value); // ใช้ setFieldValue ของ Formik
                }}
                renderLeftIcon={() => (
                    <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
                )}
            />
        )}
    </Field>
));

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
