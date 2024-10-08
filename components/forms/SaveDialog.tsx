import React, { useCallback } from "react";
import { Pressable } from "react-native";
import { Portal, Dialog, Text } from "react-native-paper";
import { SaveDialogProps } from "@/typing/value";
import axiosInstance from "@/config/axios";
import axios from "axios";
import { useToast } from "@/app/contexts";
import useMasterdataStyles from "@/styles/common/masterdata";
import AccessibleView from "../AccessibleView";
import { useRouter } from 'expo-router';

const SaveDialog = ({
    state,
    isVisible,
    setIsVisible,
    navigation
}: SaveDialogProps & { navigation: any }) => {
    const { showError } = useToast();
    const masterdataStyles = useMasterdataStyles();

    const router = useRouter();

    const errorMessage = useCallback((error: unknown) => {
        let errorMsg: string | string[];

        if (axios.isAxiosError(error)) {
            errorMsg = error.response?.data?.errors ?? ["Something went wrong!"];
        } else if (error instanceof Error) {
            errorMsg = [error.message];
        } else {
            errorMsg = ["An unknown error occurred!"];
        }

        showError(Array.isArray(errorMsg) ? errorMsg : [errorMsg]);
    }, [showError]);

    const saveForm = useCallback(async () => {
        let messages = ""

        const form = {
            FormID: state.FormID || "",
            FormName: state.FormName || "",
            Description: state.Description || "",
            MachineID: state.MachineID || "",
        }

        const data = {
            SubFormData: JSON.stringify(state.subForms),
            FormData: JSON.stringify(form),
        };

        try {
            const response = await axios.post("MatchCheckList_service.asmx/SaveFormCheckList", data);
            messages = (String(response.data.message));
        } catch (error) {
            errorMessage(error)
        } finally {
            setIsVisible(false)
            navigation.navigate("Form", { messages });
        }
    }, [state, state?.subForms]);

    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setIsVisible(false)}
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

                    <AccessibleView style={masterdataStyles.containerAction}>
                        <Pressable
                            onPress={() => saveForm()}
                            style={[
                                masterdataStyles.button,
                                masterdataStyles.backMain
                            ]}
                        >
                            <Text
                                style={[
                                    masterdataStyles.text,
                                    masterdataStyles.textBold,
                                    masterdataStyles.textLight,
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
                                    masterdataStyles.text,
                                    masterdataStyles.textBold,
                                    masterdataStyles.textLight,
                                ]}>
                                Cancel
                            </Text>
                        </Pressable>
                    </AccessibleView>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
};

export default React.memo(SaveDialog);
