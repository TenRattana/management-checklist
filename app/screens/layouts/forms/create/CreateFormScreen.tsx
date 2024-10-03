import React from "react";
import {
    ScrollView,
    Pressable,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import Dragsubform from "./Dragsubform";
import useCreateformStyle from "@/styles/createform";

interface CreateFormProps {
    route: any;
}

const CreateFormScreen: React.FC<CreateFormProps> = ({ route }) => {
    const createform = useCreateformStyle();

    return (
        <GestureHandlerRootView>
            <ScrollView style={createform.containerL1} showsVerticalScrollIndicator={false}>
                <Dragsubform route={route} />

                <Pressable onPress={() => { /* Handle Save Form */ }} style={createform.saveButton}>
                    <Text style={createform.saveButtonText}>Save Form</Text>
                </Pressable>
            </ScrollView>
        </GestureHandlerRootView>
    );
};

export default React.memo(CreateFormScreen);
