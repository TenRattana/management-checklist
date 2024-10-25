import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { View, ViewStyle, FlatList } from "react-native";
import { Card, Divider, HelperText } from "react-native-paper";
import { useRes } from "@/app/contexts";
import { BaseFormState, BaseSubForm } from '@/typing/form';
import { AccessibleView, Dynamic, Text } from "@/components";
import useForm from "@/hooks/custom/useForm";
import { FastField, Formik, FieldProps, Field } from "formik";
import useMasterdataStyles from "@/styles/common/masterdata";

interface FormValues {
    [key: string]: any;
}

const Preview = forwardRef<any, any>((props, ref) => {
    const { route, validationSchema } = props;
    const { state, groupCheckListOption, dataType } = useForm(route);

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
        <AccessibleView name="container-form-scan" style={[masterdataStyles.container, { paddingTop: 10, paddingLeft: 10 }]}>
            <FlatList
                data={[{}]}
                renderItem={() => (
                    <>
                        <Text style={[masterdataStyles.title]}>{state.FormName || "Form Name"}</Text>
                        <Divider />
                        <Text style={[masterdataStyles.description, { paddingVertical: 10 }]}>{state.Description || "Form Description"}</Text>

                        {state.subForms.map((subForm: BaseSubForm, index: number) => (
                           <Formik
                           initialValues={formValues}
                           validationSchema={validationSchema}
                           validateOnBlur={true}
                           validateOnChange={false}
                           onSubmit={(value) => console.log(value)}
                           enableReinitialize={true}
                           key={subForm.SFormID + subForm.Columns + JSON.stringify(subForm.Fields)}
                       >
                           {({ errors, touched, setFieldValue, setTouched, setFieldError }) => (
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
                       
                                               const containerStyle: ViewStyle = {
                                                   width: responsive === "small" ? "100%" : `${98 / columns}%`,
                                                   flexGrow: field.DisplayOrder || 1,
                                                   padding: 5,
                                               };
                       
                                               return (
                                                   <Field name={field.MCListID} key={`field-${fieldIndex}-${subForm.Columns}`}>
                                                       {({ field: fastFieldProps }: FieldProps) => {
                       
                                                           const type = dataType.find(v => v.DTypeID === field.DTypeID)?.DTypeName;
                       
                                                           const handleBlur = () => {
                                                               if (type === "Number") {
                                                                   const numericValue = Number(fastFieldProps.value);
                       
                                                                   if (!isNaN(numericValue) && Number(field.DTypeValue) > 0 && numericValue) {
                                                                       const formattedValue = numericValue.toFixed(Number(field.DTypeValue));
                                                                       setFieldValue(fastFieldProps.name, formattedValue);
                                                                       setTouched({
                                                                           ...touched,
                                                                           [fastFieldProps.name]: true,
                                                                       });
                                                                   } else if (isNaN(numericValue)) {
                                                                       setFieldValue(fastFieldProps.name, fastFieldProps.value);
                                                                       setTouched({
                                                                           ...touched,
                                                                           [fastFieldProps.name]: true,
                                                                       });
                                                                   }
                                                               }
                                                           };
                       
                                                           const handleCloseError = () => {
                                                               setTouched({ ...touched, [fastFieldProps.name]: false });
                                                               setFieldError(fastFieldProps.name, '');  
                                                           };
                       
                                                           return (
                                                               <View id="container-layout2" style={containerStyle}>
                                                                   <Dynamic
                                                                       field={field}
                                                                       values={String(fastFieldProps.value)}
                                                                       handleChange={(fieldname: string, value: any) => {
                                                                           setFieldValue(fastFieldProps.name, value);
                                                                           setTimeout(() => {
                                                                               setTouched({
                                                                                   ...touched,
                                                                                   [fastFieldProps.name]: true,
                                                                               });
                                                                           }, 0);
                                                                       }}
                                                                       handleBlur={handleBlur}
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
                                                                               style={[masterdataStyles.text, masterdataStyles.errorText]}
                                                                               onPress={handleCloseError}  
                                                                           >
                                                                               Close
                                                                           </Text>
                                                                       </View>
                                                                   )}
                                                               </View>
                                                           );
                                                       }}
                                                   </Field>
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
