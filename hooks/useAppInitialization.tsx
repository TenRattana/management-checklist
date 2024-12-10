import { useState, useEffect } from "react";
import * as Font from "expo-font";
import { Asset } from "expo-asset";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAppInitialization = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    const prepareApp = async () => {
        try {
            await Font.loadAsync({
                Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
                Sarabun: require("../assets/fonts/Sarabun-Regular.ttf"),
            });

            const isAssetsLoaded = await AsyncStorage.getItem("assetsLoaded");
            if (isAssetsLoaded !== "true") {
                await Asset.loadAsync([
                    require("../assets/images/bgs.jpg"),
                    require("../assets/images/Icon.jpg"),
                    require("../assets/images/Icon-app.png"),
                ]);
                await AsyncStorage.setItem("assetsLoaded", "true");
            }
        } catch (error) {
            console.warn("Error initializing app:", error);
        } finally {
            setIsInitialized(true);
        }
    };

    useEffect(() => {
        prepareApp();
    }, []);

    return isInitialized;
};
