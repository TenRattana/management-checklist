import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AccessibleView from "../AccessibleView";
import Text from "@/components/Text";
import { useTheme } from '@/app/contexts/useTheme';
import { useRes } from '@/app/contexts/useRes';
import useMasterdataStyles from '@/styles/common/masterdata';

const NotFoundScreen = () => {
    const { theme } = useTheme();
    const { spacing } = useRes()
    const masterdataStyles = useMasterdataStyles()

    return (
        <>
            <AccessibleView name="notfound" style={styles.container}>
                <Text style={[masterdataStyles.title, { color: theme.colors.onBackground }]}>This form doesn't exist.</Text>
                <TouchableOpacity style={styles.link}>
                    <Text style={[styles.linkText, { fontSize: spacing.small }]}>Scan again!</Text>
                </TouchableOpacity>
            </AccessibleView>
        </>
    );
};

export default React.memo(NotFoundScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        color: '#1e90ff',
    },
});
