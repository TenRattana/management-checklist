import React, { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { Portal, Dialog } from "react-native-paper";
import { SaveDialogProps } from "@/typing/value";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts/useToast";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";
import { useSelector } from "react-redux";
import { navigate } from "@/app/navigations/navigationUtils";

const SaveDialog = React.memo(({ state, isVisible, setIsVisible }: SaveDialogProps) => {
    const prefix = useSelector((state: any) => state.prefix);
    const { handleError, showSuccess } = useToast();
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
            PrefixForm: prefix.PF_Form,
            PrefixSForm: prefix.PF_SubForm,
            SubFormData: JSON.stringify(state.subForms),
            FormData: JSON.stringify(form),
        };

        try {
            const response = await axiosInstance.post("MatchCheckList_service.asmx/SaveFormCheckList", data);
            messages = (String(response.data.message));
            showSuccess(messages);
            navigate("Form", { fet: true });
        } catch (error) {
            handleError(error)
        } finally {
            setIsVisible(false)
        }
    }, [state, axiosInstance, handleError, setIsVisible, navigate]);

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
                        <TouchableOpacity
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
                        </TouchableOpacity>

                        <TouchableOpacity
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
                        </TouchableOpacity>
                    </View>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
});

export default SaveDialog;
