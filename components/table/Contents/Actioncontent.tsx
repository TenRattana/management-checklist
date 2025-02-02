import { TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Checkbox, IconButton } from 'react-native-paper';
import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useCustomtableStyles from '@/styles/customtable';
import { ActioncontentProps } from '@/typing/screens/CustomTable';

const Actioncontent = React.memo(({ data, action, row, rowIndex, Canedit, Candel, handlePress, selectedRows, toggleSelect }: ActioncontentProps) => {
    const { responsive, spacing } = useRes();
    const { theme } = useTheme();
    const customtable = useCustomtableStyles();

    let icon;
    switch (action) {
        case "editOnlyIndex":
            icon = <IconButton icon="pencil-box" size={(responsive === "small" ? spacing.large : spacing.large) + 5} iconColor={theme.colors.blue} />
            break;
        case "delOnlyIndex":
            icon = <IconButton icon="trash-can" size={(responsive === "small" ? spacing.large : spacing.large) + 5} iconColor={theme.colors.error}
                disabled={Boolean((Candel ?? Canedit))}
            />
            break;
        case "editIndex":
            icon = <IconButton icon="pencil-box" size={(responsive === "small" ? spacing.large : spacing.large) + 5} iconColor={theme.colors.blue} />;
            break;
        case "delIndex":
            icon = <IconButton icon="trash-can" size={(responsive === "small" ? spacing.large : spacing.large) + 5} iconColor={theme.colors.error}
                disabled={Boolean((Candel ?? Canedit))}
            />;
            break;
        case "changeIndex":
            icon = <IconButton icon="tooltip-edit" size={(responsive === "small" ? spacing.large : spacing.large)} iconColor={theme.colors.yellow} />
            break;
        case "copyIndex":
            icon = <IconButton icon="content-copy" size={(responsive === "small" ? spacing.large : spacing.large)} iconColor={theme.colors.yellow} />
            break;
        case "preIndex":
            icon = <IconButton icon="file-find" size={(responsive === "small" ? spacing.large : spacing.large) + 2} iconColor={theme.colors.yellow} />
            break;
        case "selectIndex":
            return (
                <View>
                    <Checkbox status={selectedRows?.includes(data) ? 'checked' : 'unchecked'} onPress={() => toggleSelect ? toggleSelect(data) : null} />
                </View>
            )
        default:
            return null;
    }

    return (
        <TouchableOpacity onPress={() => handlePress({
            action: action,
            data: data,
            message: row,
            visible: Boolean(!(Candel ?? Canedit)),
        }
        )} key={`action-${action}`} style={customtable.eventCell}>
            {icon}
        </TouchableOpacity>
    );
});

export default Actioncontent