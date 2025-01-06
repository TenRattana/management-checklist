import { useState, useEffect } from "react";
import * as Font from "expo-font";
import { Asset } from "expo-asset";
import * as SplashScreen from 'expo-splash-screen';

const useAppInitialization = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    const prepareApp = async () => {
        try {
            await SplashScreen.preventAutoHideAsync();

            const loadResourcesAsync = async () => {
                await Font.loadAsync({
                    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
                    Sarabun: require("../assets/fonts/Sarabun-Regular.ttf"),
                });

                const images = [
                    require("../assets/images/Icon-app.png"),
                    require("../assets/images/adaptive-icon.png"),
                    require("../assets/images/favicon.png"),
                    require("../assets/images/icon.png"),
                    require("../assets/images/partial-react-logo.png"),
                    require("../assets/images/react-logo.png"),
                ];
                const cacheImages = images.map(image => Asset.loadAsync(image));
                await Promise.all(cacheImages);
            };

            await loadResourcesAsync();
        } catch (error) {
            console.warn("Error initializing app:", error);
        } finally {
            await SplashScreen.hideAsync();
            setIsInitialized(true);
        }
    };

    useEffect(() => {
        prepareApp();
    }, []);

    return isInitialized;
};

export default useAppInitialization;
