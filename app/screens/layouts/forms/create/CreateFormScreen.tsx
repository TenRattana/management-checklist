import React, { useState, useEffect, useCallback, useRef, useMemo, useImperativeHandle } from "react";
import { Dimensions, Pressable, View, PanResponder, FlatList, ViewStyle } from "react-native";
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { IconButton, Text, Divider, HelperText, Card } from "react-native-paper";
import useCreateformStyle from "@/styles/createform";
import useMasterdataStyles from "@/styles/common/masterdata";
import useForm from "@/hooks/custom/useForm";
import { AccessibleView, Inputs, SaveDialog, Dynamic } from "@/components";
import Dragsubform from "./Dragsubform";
import Preview from "@/app/screens/layouts/forms/view/Preview";
import { CreateFormProps } from "@/typing/tag";
import { BaseForm, BaseFormState, BaseSubForm } from "@/typing/form";
import { updateForm } from "@/slices";
import { CheckListType, DataType } from "@/typing/type";
import { useRes } from "@/app/contexts";
import { defaultDataForm } from "@/slices";
import * as Yup from 'yup';
import { FastField, FieldProps, Formik } from "formik";

const { height: screenHeight } = Dimensions.get('window');

interface FormValues {
    [key: string]: any;
}

const DraggableItem: React.FC<{
    item: CheckListType;
    onDrop: (item: CheckListType, x: number, y: number) => void;
}> = ({ item, onDrop }) => {
    const itemTranslateX = useSharedValue(0);
    const itemTranslateY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const itemAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: itemTranslateX.value },
            { translateY: itemTranslateY.value },
        ],
    }));

    const createform = useCreateformStyle();
    const { spacing } = useRes();

    const onGestureEvent = (e: any) => {
        itemTranslateX.value = e.nativeEvent.translationX;
        itemTranslateY.value = e.nativeEvent.translationY;
        isDragging.value = true;
    };

    const onGestureEnd = (e: any) => {
        const { absoluteX, absoluteY } = e.nativeEvent;

        const dropX = absoluteX + itemTranslateX.value;
        const dropY = absoluteY + itemTranslateY.value;

        runOnJS(onDrop)(item, dropX, dropY);

        itemTranslateX.value = withSpring(0);
        itemTranslateY.value = withSpring(0);
        isDragging.value = false;
    };

    return (
        // <AccessibleView name={`drag-form-${item.CTypeID}`} style={{ paddingHorizontal: 16 }}>
            <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
                <Animated.View style={[{ marginHorizontal: 10 }, itemAnimatedStyle, createform.addSubFormButton]}>
                    <IconButton icon={item.Icon} size={spacing.large + 5} animated />
                    <Text style={[createform.fieldText, { textAlign: "left", flex: 1, paddingLeft: 5 }]}>
                        {item.CTypeName}
                    </Text>
                    {isDragging.value && (
                        <View style={{
                        
                        }}>
                            <Text style={{ fontWeight: 'bold', color: 'black' }}>Dragging...</Text>
                        </View>
                    )}
                </Animated.View>
            </PanGestureHandler>
        // </AccessibleView>
    );
};

type ChildRef = {
    getCardPosition: (callback: (x: number, y: number) => void) => void;
    checkCardPosition: (x: number, y: number) => number;
};

const CreateFormScreen: React.FC<CreateFormProps> = ({ route, navigation }) => {
    const { state, dispatch, checkList, groupCheckListOption, checkListType, dataType } = useForm(route);
    const createform = useCreateformStyle();
    const masterdataStyles = useMasterdataStyles();
    const [formValues, setFormValues] = useState<FormValues>({});
    const [initialSaveDialog, setInitialSaveDialog] = useState(false);
    const { responsive } = useRes();

    const formRef = useRef<BaseForm>({
        FormID: "",
        FormName: "",
        Description: "",
        MachineID: "",
    });

    const [initialForm, setInitialForm] = useState<BaseForm>(formRef.current);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const newForm: BaseForm = {
            FormID: state.FormID || "",
            FormName: state.FormName || "",
            Description: state.Description || "",
            MachineID: state.MachineID || "",
        };
        setInitialForm(newForm);
        formRef.current = newForm;
    }, [state]);

    const handleChange = useCallback((fieldName: keyof BaseForm, value: string) => {
        const newForm = { ...formRef.current, [fieldName]: value };
        formRef.current = newForm;
        setInitialForm(newForm);
        dispatch(updateForm({ form: newForm }));
    }, [dispatch]);

    const handleSaveDialog = useCallback(() => {
        setInitialSaveDialog(false);
    }, []);

    const childRef = useRef<any>();
    const cardRef = useRef<View>(null);

    const cardRefs = useRef<(View | null)[]>([]);
    const cardPositions = useRef<{ pageX: number; pageY: number; width: number; height: number }[]>([]);

    useImperativeHandle(childRef, () => ({
        getCardPosition: (callback: (x: number, y: number) => void) => {
            if (cardRef.current) {
                cardRef.current.measure((x, y, width, height, pageX, pageY) => {
                    callback(pageX, pageY);
                });
            }
        },
        checkCardPosition: (x: number, y: number) => {
            console.log(x, y);
            console.log(cardPositions.current);
            // console.log(panResponder.panHandlers?.onPanResponderRelease());
            return cardPositions.current.findIndex((card) =>
                x >= card.pageX && x <= card.pageX + card.width &&
                y >= card.pageY && y <= card.pageY + card.height
            );
        },
    }));

    // const panResponder = useRef(
    //     PanResponder.create({
    //         onMoveShouldSetPanResponder: () => true,
    //         onPanResponderRelease: () => {
    //             if (cardRef.current) {
    //                 cardRef.current.measure((x, y, width, height, pageX, pageY) => {
    //                     console.log(`ตำแหน่งของการ์ด: pageX: ${pageX}, pageY: ${pageY}, width: ${width}, height: ${height}`);
    //                 });
    //             }
    //         },
    //     })
    // ).current;

    useEffect(() => {
        const positions: { pageX: number; pageY: number; width: number; height: number }[] = [];
        cardRefs.current.forEach((cardRef) => {
            if (cardRef) {
                cardRef.measure((x, y, width, height, pageX, pageY) => {
                    positions.push({ pageX, pageY, width, height });
                });
            }
        });
        cardPositions.current = positions;
    }, [state.subForms]);

    useEffect(() => {
        const positions: { pageX: number; pageY: number; width: number; height: number }[] = [];
        cardRefs.current.forEach((cardRef) => {
            if (cardRef) {
                cardRef.measure((x, y, width, height, pageX, pageY) => {
                    positions.push({ pageX: pageX + 400, pageY, width, height });
                });
            }
        });
        cardPositions.current = positions;
    }, [state.subForms]);

    const handleDrop = (item: CheckListType, x: number, y: number) => {
        const cardIndex = childRef.current.checkCardPosition(x, y);
        console.log(cardIndex);
        console.log(x, y);

        if (cardIndex >= 0) {
            const targetSubForm = state.subForms[cardIndex];
            const currentFieldCount = targetSubForm?.Fields?.length ?? 0;
            const selectedChecklist = checkList.find(v => v.CListID === "CL000") || checkList[0];
            const selectedDataType = dataType.find(v => v.DTypeName === "String") || dataType[0];

            const newField: BaseFormState = {
                MCListID: `MCL-ADD-${currentFieldCount}`,
                CListID: selectedChecklist.CListID,
                GCLOptionID: "",
                CTypeID: item.CTypeID,
                DTypeID: selectedDataType.DTypeID,
                SFormID: targetSubForm.SFormID,
                Required: false,
                Placeholder: "Empty content",
                Hint: "Empty content",
                EResult: "",
                CListName: selectedChecklist.CListName,
                CTypeName: item.CTypeName,
                DTypeValue: undefined,
                MinLength: undefined,
                MaxLength: undefined
            };

            newField.GCLOptionID = ["Dropdown", "Radio", "Checkbox"].includes(item.CTypeName)
                ? (groupCheckListOption.find(v => v.GCLOptionID === "GCLO000") || groupCheckListOption[0])?.GCLOptionID
                : undefined;

            dispatch(defaultDataForm({ currentField: newField }));
        }
    };

    const validationSchema = useMemo(() => {
        const shape: any = {};

        state.subForms?.forEach((subForm: BaseSubForm) => {
            subForm.Fields?.forEach((field: BaseFormState) => {
                const dataTypeName = dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
                const checkListTypeName = checkListType.find(item => item.CTypeID === field.CTypeID)?.CTypeName;

                if (dataTypeName === "Number") {
                    let validator = Yup.number()
                        .nullable()
                        .typeError(`The ${field.CListName} field requires a valid number`);

                    if (field.Required) {
                        validator = validator.required(`The ${field.Placeholder} field is required`);
                    }

                    if (field.MinLength) {
                        validator = validator.min(field.MinLength, `The ${field.CListName} minimum value is ${field.MinLength}`);
                    }

                    if (field.MaxLength) {
                        validator = validator.max(field.MaxLength, `The ${field.CListName} maximum value is ${field.MaxLength}`);
                    }

                    shape[field.MCListID] = validator;
                } else if (dataTypeName === "String") {
                    let validator;

                    if (checkListTypeName === "Checkbox") {
                        validator = Yup.array()
                            .of(Yup.string())
                            .min(1, `The ${field.CListName} field requires at least one option to be selected`);
                    } else {
                        validator = Yup.string()
                            .nullable()
                            .typeError(`The ${field.CListName} field requires a valid string`);
                    }

                    if (field.Required) {
                        validator = validator.required(`The ${field.Placeholder} field is required`);
                    }

                    shape[field.MCListID] = validator;
                }
            });
        });

        return Yup.object().shape(shape);
    }, [state.subForms, dataType, checkListType]);

    return (
        <GestureHandlerRootView style={[createform.container]}>
            <AccessibleView name="" style={[createform.containerL1, {}]}>
                <FlatList
                    data={[{}]}
                    renderItem={() => selectedIndex === 0 ? (
                        <>
                            <Inputs
                                placeholder="Enter Content Name"
                                label="Content Name"
                                handleChange={(value) => handleChange("FormName", value)}
                                value={initialForm.FormName}
                            />
                            <Inputs
                                placeholder="Enter Description"
                                label="Description"
                                handleChange={(value) => handleChange("Description", value)}
                                value={initialForm.Description}
                            />
                            <Divider bold />

                            <Text style={[masterdataStyles.title, { textAlign: 'center', paddingTop: 10 }]}>Menu List Type</Text>

                            <AccessibleView name="" style={{ paddingBottom: 40, marginBottom: 30 }}>
                                {checkListType.map((item, index) => (
                                    <DraggableItem item={item} onDrop={handleDrop} key={`${item.CTypeID}-${index}`} />

                                ))}
                            </AccessibleView>
                        </>
                    ) : (
                        <Dragsubform navigation={navigation}
                            state={state}
                            dispatch={dispatch}
                            checkList={checkList}
                            dataType={dataType}
                            checkListType={checkListType}
                            groupCheckListOption={groupCheckListOption} />
                    )}
                    keyExtractor={(_, index) => `${index}`}
                    ListHeaderComponent={() => (
                        <>
                            <SegmentedControl
                                values={["Form", "Tool"]}
                                selectedIndex={selectedIndex}
                                onChange={(event) => {
                                    const newIndex = event.nativeEvent.selectedSegmentIndex;
                                    setSelectedIndex(newIndex);
                                }}
                                style={{ height: 80, marginBottom: 10, borderRadius: 0 }}
                            />
                        </>
                    )}
                    contentContainerStyle={{
                        maxHeight: screenHeight * 0.7,
                    }}
                />
            </AccessibleView>

            <AccessibleView name="" style={[createform.containerL2, {}]}>
                <FlatList
                    data={state.subForms}
                    renderItem={({ item, index }) => (
                        <Formik
                            initialValues={formValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(value) => console.log(value)}
                            key={item.SFormID + item.Columns}
                        >
                            {({ errors, touched, setFieldValue, setTouched }) => (
                                <>
                                    <Card
                                        style={masterdataStyles.card}
                                        ref={(el) => (cardRefs.current[index] = el)}
                                        // {...panResponder.panHandlers} 
                                        key={item.SFormID}
                                    >
                                        <Card.Title
                                            title={item.SFormName}
                                            titleStyle={masterdataStyles.cardTitle}
                                        />
                                        <Card.Content style={[masterdataStyles.subFormContainer]}>
                                            {item.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                                                const columns = item.Columns ?? 1;

                                                const containerStyle: ViewStyle = {
                                                    width: responsive === "small" ? "100%" : `${98 / columns}%`,
                                                    flexGrow: field.DisplayOrder || 1,
                                                    padding: 5,
                                                };

                                                return (
                                                    <FastField name={field.MCListID} key={`field-${fieldIndex}-${item.Columns}`}>
                                                        {({ field: fastFieldProps }: FieldProps) => (
                                                            <AccessibleView name="container-layout2" style={containerStyle}>
                                                                <Dynamic
                                                                    field={field}
                                                                    values={fastFieldProps.value ?? ""}
                                                                    handleChange={(fieldName: string, value: any) => {
                                                                        setFieldValue(fastFieldProps.name, value);
                                                                        setTimeout(() => {
                                                                            setTouched({
                                                                                ...touched,
                                                                                [fastFieldProps.name]: true,
                                                                            });
                                                                        }, 0);
                                                                    }}
                                                                    groupCheckListOption={groupCheckListOption}
                                                                />
                                                                {Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name]) && (
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                        <HelperText
                                                                            type="error"
                                                                            visible={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
                                                                            style={{ left: -10 }}
                                                                        >
                                                                            {errors[fastFieldProps.name] || ""}
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
                    )}
                    keyExtractor={(_, index) => `${index}`}
                    ListHeaderComponent={() => (
                        <>
                            <Text style={masterdataStyles.title}>{state.FormName || "Content Name"}</Text>
                            <Divider />
                            <Text style={masterdataStyles.description}>{state.Description || "Content Description"}</Text>
                        </>
                    )}
                    contentContainerStyle={{
                        maxHeight: screenHeight * 0.7,
                    }}
                />
            </AccessibleView>

            <SaveDialog
                state={state}
                isVisible={initialSaveDialog}
                setIsVisible={handleSaveDialog}
                navigation={navigation} />
        </GestureHandlerRootView>
    );
};

export default CreateFormScreen;
