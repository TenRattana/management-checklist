import React from 'react';
import { StyleSheet } from 'react-native';
import { AccessibleView } from "@/components";
import Text from "@/components/Text";
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';

const NotFoundScreen404 = () => {
    const { theme } = useTheme();
    const masterdataStyles = useMasterdataStyles()

    return (
        <>
            <AccessibleView name="notfound" style={styles.container}>
                <Text style={[masterdataStyles.title, { color: theme.colors.onBackground }]}>404 Not Found.</Text>
            </AccessibleView>
        </>
    );
};

export default React.memo(NotFoundScreen404);

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
