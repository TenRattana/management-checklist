import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import { Portal, Dialog } from "react-native-paper";
import { SaveDialogProps } from "@/typing/value";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";
import { useSelector } from "react-redux";

const SaveDialog = ({
    state,
    isVisible,
    setIsVisible,
    navigation
}: SaveDialogProps & { navigation: any }) => {
    const prefix = useSelector((state: any) => state.prefix);
    const { handleError } = useToast();
    const masterdataStyles = useMasterdataStyles();

    const saveForm = useCallback(async () => {
        let messages = ""

        const form = {
            FormID: state.FormID || "",
            FormName: state.FormName || "",
            Description: state.Description || "",
            MachineID: state.MachineID || "",
        }

        const data = {
            PrefixForm: prefix.Form,
            PrefixSForm: prefix.SubForm,
            SubFormData: JSON.stringify(state.subForms),
            FormData: JSON.stringify(form),
        };

        console.log(state.subForms);

        // try {
        //     const response = await axiosInstance.post("MatchCheckList_service.asmx/SaveFormCheckList", data);
        //     messages = (String(response.data.message));
        //     navigation.navigate("Form", { messages });
        // } catch (error) {
        //     handleError(error)
        // } finally {
        //     setIsVisible(false)
        // }
    }, [state, state?.subForms]);

    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setIsVisible(false)}
                style={masterdataStyles.containerDialog}
            >
                <Dialog.Title style={[
                    masterdataStyles.text,
                    masterdataStyles.textBold,
                    { paddingLeft: 8 },
                ]}>Save Form</Dialog.Title>
                <Dialog.Content>
                    <Text
                        style={[
                            masterdataStyles.text,
                            masterdataStyles.textDark,
                            { marginBottom: 10, paddingLeft: 10 },
                        ]}
                    >
                        You are about to save the form. Are you sure?
                    </Text>

                    <View id="sd" style={masterdataStyles.containerAction}>
                        <Pressable
                            onPress={() => saveForm()}
                            style={[
                                masterdataStyles.button,
                                masterdataStyles.backMain
                            ]}
                        >
                            <Text
                                style={[
                                    masterdataStyles.textFFF,
                                    masterdataStyles.textBold,
                                ]}>
                                Save
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setIsVisible(false)}
                            style={[
                                masterdataStyles.button,
                                masterdataStyles.backMain
                            ]}
                        >
                            <Text
                                style={[
                                    masterdataStyles.textFFF,
                                    masterdataStyles.textBold,
                                ]}>
                                Cancel
                            </Text>
                        </Pressable>
                    </View>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
};

export default React.memo(SaveDialog);
