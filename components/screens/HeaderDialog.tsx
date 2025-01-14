import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Icon, IconButton } from 'react-native-paper'
import useMasterdataStyles from '@/styles/common/masterdata'
import { useRes } from '@/app/contexts/useRes'
import { useTheme } from '@/app/contexts/useTheme'
import Text from '../Text'

const HeaderDialog = React.memo(({ isEditing, setIsVisible, display }: { isEditing: boolean, setIsVisible: (v: boolean) => void, display: string }) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    const { spacing } = useRes()

    const styles = StyleSheet.create({
        container: {
            justifyContent: "space-between",
            flexDirection: 'row',
            alignItems: 'center'
        },
        containerHead: {
            justifyContent: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center'
        }
    })

    return (
        <>
            <View style={styles.container}>
                <View style={styles.containerHead}>
                    <Icon source="information-outline" size={spacing.large} color={theme.colors.green} />
                    <Text style={[masterdataStyles.text, masterdataStyles.title, masterdataStyles.textBold, { paddingLeft: 8 }]}>{isEditing ? "Edit" : "Create"}
                    </Text>
                </View>
                <IconButton icon="close" size={20} iconColor={theme.colors.onBackground} onPress={() => setIsVisible(false)} />
            </View>

            <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}>
                {isEditing
                    ? `Edit the details of the ${display}.`
                    : `Enter the details for the new ${display}.`}
            </Text>
        </>
    )
})

export default HeaderDialog