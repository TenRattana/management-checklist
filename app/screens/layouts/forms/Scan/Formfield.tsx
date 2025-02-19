import { FlatList, View, ViewStyle } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { BaseFormState } from '@/typing/form';
import { useRes } from '@/app/contexts/useRes';
import { FieldProps, FastField, Field } from 'formik';
import { Dynamic } from '@/components';
import { FiledScan } from '@/typing/screens/Scan';

const Formfield = React.memo(({ item, field, dataType, setFieldValue, setFieldTouched, touched, values, errors }: FiledScan) => {
    const { responsive } = useRes();

    const getType = useMemo(() => (field: BaseFormState) => {
        return dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
    }, [dataType]);

    const handleBlur = useCallback((field: BaseFormState) => {
        if (getType(field) === "Number" && values[field.MCListID] !== "") {
            const numericValue = Number(values[field.MCListID]);
            if (!isNaN(numericValue) && Number(field.DTypeValue) > 0) {
                const formattedValue = numericValue.toFixed(Number(field.DTypeValue));
                setFieldValue(field.MCListID, formattedValue);
            }
        }
        setFieldTouched(field.MCListID, true);
    }, [getType, setFieldValue, setFieldTouched, touched, values]);

    const handleChange = useCallback((fieldName: string, value: any) => {
        setFieldValue(fieldName, value);
        setFieldTouched(fieldName, true);
    }, [setFieldValue, setFieldTouched, touched]);

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
                    const hasError = Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name]);
                    return (
                        <View id="container-layout2" style={containerStyle} key={`dynamic-${fieldIndex}-${item.Columns}`}>
                            <Dynamic
                                field={field}
                                values={String(fastFieldProps.value ?? "")}
                                handleChange={handleChange}
                                handleBlur={() => handleBlur(field)}
                                error={hasError}
                                errorMessages={errors}
                                number={field.CListName}
                                type={getType(field)}
                            />
                        </View>
                    );
                }}
            </FastField>
        );
    });
});

export default Formfield;
