import { GestureHandlerRootView } from "react-native-gesture-handler";
import Dragsubform from "./Dragsubform";
import useCreateformStyle from "@/styles/createform";
import React from "react";
import useForm from "@/hooks/custom/useForm";
import { AccessibleView } from "@/components";
import Preview from "@/app/screens/layouts/forms/view/Preview";

interface CreateFormProps {
    route: any;
    navigation: any;
}

const CreateFormScreen: React.FC<CreateFormProps> = ({ route, navigation }) => {
    const {
        state,
        dispatch,
        checkList,
        groupCheckListOption,
        checkListType,
        dataType,
        errorMessage,
    } = useForm(route);

    const createform = useCreateformStyle();

    console.log("A");

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <AccessibleView style={[createform.container]}>
                <AccessibleView style={createform.containerL1}>
                    <Dragsubform
                        navigation={navigation}
                        errorMessage={errorMessage}
                        state={state}
                        dispatch={dispatch}
                        checkList={checkList}
                        dataType={dataType}
                        checkListType={checkListType}
                        groupCheckListOption={groupCheckListOption}
                    />

                </AccessibleView>

                <AccessibleView style={createform.containerL2}>
                    <Preview route={route} />
                </AccessibleView>
            </AccessibleView>
        </GestureHandlerRootView>
    );
};

export default React.memo(CreateFormScreen);
