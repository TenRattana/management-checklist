import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useToast } from '@/app/contexts/useToast';
import React from 'react';
import * as FileSystem from 'expo-file-system';
import { Stack, useFocusEffect } from 'expo-router';
import { useTheme } from '@/app/contexts/useTheme';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import useMasterdataStyles from '@/styles/common/masterdata';
import Slider from '@react-native-community/slider';

const Camera: React.FC = React.memo(() => {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<string | null>(null);
    const [zoom, setZoom] = useState<number>(0);
    const { theme } = useTheme();
    const cameraRef = useRef<CameraView>(null);
    const { handleError } = useToast();
    const navigation = useNavigation();

    const masterdataStyles = useMasterdataStyles()

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
        },
        message: {
            textAlign: 'center',
            paddingBottom: 10,
            color: theme.colors.text,
        },
        camera: {
            flex: 1,
            width: '100%',
            height: '100%',
            borderRadius: 0,
            overflow: 'hidden',
        },
        buttonContainer: {
            position: 'absolute',
            justifyContent: 'center',
            right: 30,
        },
        shutterButton: {
            width: 50,
            height: 50,
            backgroundColor: 'white',
            borderRadius: 100,
            borderWidth: 2,
            borderColor: theme.colors.blue,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
        },
        shutterButtonZ: {
            width: 65,
            height: 65,
            borderRadius: 100,
            borderWidth: 5,
            borderColor: theme.colors.fff,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
        },
        flipButton: {
            alignSelf: 'center',
            marginBottom: 30,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 10,
        },
        backButton: {
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 10,
            padding: 10,
            backgroundColor: theme.colors.error,
            borderRadius: 10,
            borderColor: theme.colors.fff
        },
        previewContainer: {
            width: 80,
            height: 80,
            marginTop: 30,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: theme.colors.onBackground,
            backgroundColor: theme.colors.onBackground,
            overflow: 'hidden',
        },
        previewImage: {
            width: '100%',
            height: '100%',
            borderRadius: 10,
        },
        buttonContainerZoom: {
            position: 'absolute',
            justifyContent: 'center',
            left: 30,
            bottom: 30,
            zIndex: 10,
        },
        slider: {
            width: 200,
            height: 40,
        }
    });

    useEffect(() => {
        const lockOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
        };
        lockOrientation();
    }, []);

    useFocusEffect(
        useCallback(() => {
            return () => {
                ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
            };
        }, [])
    );

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const takeAndSavePicture = async () => {
        if (cameraRef.current) {
            try {
                const photoData = await cameraRef.current.takePictureAsync();

                const fileUri = FileSystem.documentDirectory + `photo_${Date.now()}.jpg`;

                if (photoData?.uri) {
                    await FileSystem.copyAsync({
                        from: photoData.uri,
                        to: fileUri,
                    });

                    setPhoto(fileUri);
                }
            } catch (error) {
                handleError('Error while taking or saving picture');
            }
        }
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                <Text style={masterdataStyles.textFFF}>Back</Text>
            </TouchableOpacity>

            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                mute
                autofocus='on'
                mode='picture'
                zoom={zoom}
            />

            <View style={styles.buttonContainerZoom}>
                <Text style={masterdataStyles.textFFF}>Zoom Level</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    step={0.01}
                    value={zoom}
                    onValueChange={setZoom}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={theme.colors.text}
                    thumbTintColor={theme.colors.primary}
                />
                <Text style={masterdataStyles.textFFF}>{(zoom * 100).toFixed(0)}%</Text>
            </View>

            <View style={styles.buttonContainer}>
                <View style={styles.flipButton}>
                    <IconButton icon={"camera-flip-outline"} size={30} iconColor={theme.colors.fff} onPress={toggleCameraFacing} />
                </View>

                <TouchableOpacity style={styles.shutterButton} onPress={takeAndSavePicture}>
                    <View style={styles.shutterButtonZ}></View>
                </TouchableOpacity>

                <View style={styles.previewContainer}>
                    {photo && (
                        <Image source={{ uri: photo }} style={styles.previewImage} />
                    )}
                </View>
            </View>
        </View>
    );
});

export default Camera;
