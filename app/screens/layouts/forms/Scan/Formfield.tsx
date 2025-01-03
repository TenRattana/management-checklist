import { View, ViewStyle } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { BaseFormState, BaseSubForm } from '@/typing/form';
import { useRes } from '@/app/contexts/useRes';
import { DataType } from '@/typing/type';
import { FieldProps, FormikErrors, FormikTouched, FastField } from 'formik';
import { Dynamic } from '@/components';

interface FormValues {
    [key: string]: any;
}

const Formfield = React.memo(({ item, field, dataType, setFieldValue, setTouched, touched, values, errors }:
    {
        item: BaseSubForm, field: BaseFormState[], dataType: DataType[], setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<FormValues>>, setTouched: (touched: FormikTouched<FormValues>, shouldValidate?: boolean) => Promise<void | FormikErrors<FormValues>>,
        touched: FormikTouched<FormValues>, values: FormValues, errors: FormikErrors<FormValues>
    }) => {
    const { responsive } = useRes();

    const getType = useMemo(() => (field: BaseFormState) => {
        return dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
    }, [dataType]);

    const handleBlur = useCallback((field: BaseFormState) => {
        if (getType(field) === "Number") {
            const numericValue = Number(values[field.MCListID]);
            if (!isNaN(numericValue) && Number(field.DTypeValue) > 0) {
                const formattedValue = numericValue.toFixed(Number(field.DTypeValue));
                setFieldValue(field.MCListID, formattedValue);
            }
        }
        setTouched({ ...touched, [field.MCListID]: true });
    }, [getType, setFieldValue, setTouched, touched, values]);

    const handleChange = useCallback((fieldName: string, value: any) => {
        setFieldValue(fieldName, value);
        setTouched({ ...touched, [fieldName]: true });
    }, [setFieldValue, setTouched, touched]);

    return field.map((field, fieldIndex) => {
        const columns = item.Columns ?? 1;

        const containerStyle: ViewStyle = {
            width: responsive === "small" ? "100%" : `${98 / columns}%`,
            flexShrink: 1,
            flexGrow: field.Rowcolumn || 1,
            flexBasis: responsive === "small" ? "100%" : `${100 / (columns / (field.Rowcolumn || 1))}%`,
            padding: 5,
        };

        return (
            <FastField name={field.MCListID} key={`field-${fieldIndex}-${item.Columns}`}>
                {({ field: fastFieldProps }: FieldProps) => {
                    return (
                        <View id="container-layout2" style={containerStyle} key={`dynamic-${fieldIndex}-${item.Columns}`}>
                            <Dynamic
                                field={field}
                                values={String(fastFieldProps.value ?? "")}
                                handleChange={handleChange}
                                handleBlur={() => handleBlur(field)}
                                error={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
                                errorMessages={errors}
                                number={field.CListName}
                                type={getType(field)}
                            />
                        </View>
                    );
                }}
            </FastField>
        );
    })
});

export default Formfield;
