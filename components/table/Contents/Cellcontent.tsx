import React from 'react'
import { TouchableOpacity } from "react-native";
import Text from "@/components/Text";
import { IconButton } from 'react-native-paper';
import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import { CellcontentProps } from '@/typing/screens/CustomTable';

const Cellcontent = React.memo(({ cell, cellIndex, row, rowIndex, Canedit, Candel, handlePress }: CellcontentProps) => {
    const { theme } = useTheme();
    const { spacing } = useRes();
    const masterdataStyles = useMasterdataStyles();

    if (typeof cell === "boolean") {
        return (
            <TouchableOpacity onPress={() => handlePress({
                action: "activeIndex",
                data: String(row[cellIndex + 1]),
                message: row,
                visible: Boolean(!(Canedit)),
                Change: "Change Status"
            }
            )} key={`cell-content-${cellIndex}`}>
                <IconButton
                    icon={cell ? "toggle-switch" : "toggle-switch-off-outline"}
                    size={spacing.large + 10}
                    iconColor={cell ? theme.colors.green : theme.colors.secondary}
                    disabled={Boolean(Canedit)}
                />
            </TouchableOpacity>
        );
    }

    return <Text key={`cell-content-${cellIndex}`} style={masterdataStyles.text}>{String(cell)}</Text>;
});

export default Cellcontent