import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Text, View, ViewStyle, FlatList } from "react-native";
import { Card, Divider, HelperText } from "react-native-paper";
import { useRes } from "@/app/contexts";
import { BaseFormState, BaseSubForm } from '@/typing/form';
import { AccessibleView, Dynamic } from "@/components";
import useForm from "@/hooks/custom/useForm";
import { FastField, Formik, FieldProps } from "formik";
import useMasterdataStyles from "@/styles/common/masterdata";

interface FormValues {
    [key: string]: any;
}

const Preview = forwardRef<any, any>((props, ref) => {
    const { route, validationSchema } = props;
    const { state, groupCheckListOption } = useForm(route);

    const masterdataStyles = useMasterdataStyles();
    const cardRef = useRef<View>(null);
    const { responsive } = useRes();
    const [formValues, setFormValues] = useState<FormValues>({});

    const cardRefs = useRef<(View | null)[]>([]);
    const cardPositions = useRef<{ x: number; y: number; width: number; height: number }[]>([]);

    const handleScroll = () => {
        updateCardPositions();
    };

    const updateCardPositions = () => {
        const positions: { x: number; y: number; width: number; height: number }[] = [];
        cardRefs.current.forEach((cardRef, index) => {
            if (cardRef) {
                cardRef.measureInWindow((x, y, width, height) => {
                    positions.push({ x, y, width: width + 350, height: height + 16 });
                });
            }
        });
        cardPositions.current = positions;
    };

    useEffect(() => {
        updateCardPositions();
    }, [state.subForms]);

    useImperativeHandle(ref, () => ({
        getCardPosition: (callback: (x: number, y: number) => void) => {
            if (cardRef.current) {
                cardRef.current.measure((x, y, width, height, pageX, pageY) => {
                    callback(pageX, pageY);
                });
            }
        },
        checkCardPosition: (x: number, y: number) => {
            return cardPositions.current.findIndex((card) =>
                x >= card.x && x <= card.x + card.width &&
                y >= card.y && y <= card.y + card.height
            );
        },
    }));

    useEffect(() => {
        if (state.subForms) {
            const initialValues: { [key: string]: any } = {};
            state.subForms.forEach((subForm: BaseSubForm) => {
                subForm.Fields.forEach((field: BaseFormState) => {
                    initialValues[field.MCListID] = field.EResult ?? "";
                });
            });
            setFormValues(initialValues);
        }
    }, [state.subForms]);

    return (
        <AccessibleView name="container-form-scan" style={[masterdataStyles.container, { paddingHorizontal: 5 }]}>
            <FlatList
                data={[{}]}
                renderItem={() => (
                    <>
                        <Text style={masterdataStyles.title}>{state.FormName || "Content Name"}</Text>
                        <Divider />
                        <Text style={masterdataStyles.description}>{state.Description || "Content Description"}</Text>

                        {state.subForms.map((subForm: BaseSubForm, index: number) => (
                            <Formik
                                initialValues={formValues}
                                validationSchema={validationSchema}
                                validateOnBlur={true}
                                validateOnChange={false}
                                onSubmit={(value) => console.log(value)}
                                enableReinitialize={true}
                                key={subForm.SFormID + subForm.Columns}
                            >
                                {({ errors, touched, setFieldValue, setTouched }) => (
                                    <>
                                        <Card
                                            style={masterdataStyles.card}
                                            ref={(el) => (cardRefs.current[index] = el)}
                                            key={subForm.SFormID}
                                        >
                                            <Card.Title
                                                title={subForm.SFormName}
                                                titleStyle={masterdataStyles.cardTitle}
                                            />
                                            <Card.Content style={[masterdataStyles.subFormContainer]}>
                                                {subForm.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                                                    const columns = subForm.Columns ?? 1;
                                                    // const isLastColumn = (fieldIndex + 1) % columns === 0;

                                                    const containerStyle: ViewStyle = {
                                                        width: responsive === "small" ? "100%" : `${98 / columns}%`,
                                                        flexGrow: field.DisplayOrder || 1,
                                                        padding: 5,
                                                        // borderRightWidth: isLastColumn ? 0 : 1,
                                                    };
                                                    return (
                                                        <FastField name={field.MCListID} key={`field-${fieldIndex}-${subForm.Columns}`}>
                                                            {({ field: fastFieldProps }: FieldProps) => (
                                                                <AccessibleView name="container-layout2" style={containerStyle}>
                                                                    <Dynamic
                                                                       field={field}
                                                                       values={displayValue}  
                                                                       handleChange={handleInputChange}  
                                                                       groupCheckListOption={groupCheckListOption}
                                                                    />
                                                                    {Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name]) && (
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                            <HelperText
                                                                                type="error"
                                                                                visible={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
                                                                                style={{ left: -10 }}
                                                                            >
                                                                                {errors[fastFieldProps.name] as string || ""}
                                                                            </HelperText>
                                                                            <Text
                                                                                style={{ color: 'blue', marginLeft: 10 }}
                                                                                onPress={() => {
                                                                                    setTouched({ ...touched, [fastFieldProps.name]: false });
                                                                                }}
                                                                            >
                                                                                Close
                                                                            </Text>
                                                                        </View>
                                                                    )}
                                                                </AccessibleView>
                                                            )}
                                                        </FastField>
                                                    );
                                                })}
                                            </Card.Content>
                                        </Card>
                                    </>
                                )}
                            </Formik>
                        )
                        )}
                    </>

                )}
                keyExtractor={(_, index) => index.toString()}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </AccessibleView>
    );
});

export default React.memo(Preview);



import React, { useState } from 'react';


// <FastField name={field.MCListID} key={`field-${fieldIndex}-${subForm.Columns}`}>
//     {({ field: fastFieldProps }: FieldProps) => {
//         const [displayValue, setDisplayValue] = useState(fastFieldProps.value || "");

//         const handleInputChange = (value: string) => {
//             // อัปเดตค่าที่ผู้ใช้กรอก
//             setDisplayValue(value);
//             if (value === "" || !isNaN(value)) {
//                 setFieldValue(fastFieldProps.name, value);
//                 setTouched({
//                     ...touched,
//                     [fastFieldProps.name]: true,
//                 });
//             }
//         };

//         return (
//             <AccessibleView name="container-layout2" style={containerStyle}>
//                 <Dynamic
//                     field={field}
//                     values={displayValue}  // แสดงค่าที่ผู้ใช้กรอก
//                     handleChange={handleInputChange}  // ส่งค่าเข้าไปในฟิลด์
//                     groupCheckListOption={groupCheckListOption}
//                 />
//                 {Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name]) && (
//                     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                         <HelperText
//                             type="error"
//                             visible={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
//                             style={{ left: -10 }}
//                         >
//                             {errors[fastFieldProps.name] as string || ""}
//                         </HelperText>
//                         <Text
//                             style={{ color: 'blue', marginLeft: 10 }}
//                             onPress={() => {
//                                 setTouched({ ...touched, [fastFieldProps.name]: false });
//                             }}
//                         >
//                             Close
//                         </Text>
//                     </View>
//                 )}
//             </AccessibleView>
//         );
//     }}
// </FastField>
