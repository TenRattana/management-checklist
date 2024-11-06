import React from 'react'
import { Pressable } from "react-native";
import Text from "@/components/Text";
import { IconButton } from 'react-native-paper';
import { useRes, useTheme } from '@/app/contexts';
import useMasterdataStyles from '@/styles/common/masterdata';
import { CellProps, HandelPrssProps } from "@/typing/tag";

interface CellcontentProps extends CellProps {
    handlePress: (props: HandelPrssProps) => void
}

const Cellcontent = React.memo(({ cell, cellIndex, row, rowIndex, Canedit, handlePress }: CellcontentProps) => {
    const { theme } = useTheme();
    const { spacing } = useRes();
    const masterdataStyles = useMasterdataStyles();

    if (typeof cell === "boolean") {
        return (
            <Pressable onPress={() => handlePress({
                action: "activeIndex",
                data: String(row[cellIndex + 1]),
                message: row,
                visible: Boolean(!Canedit),
                Change: "Change Status"
            }
            )} key={`cell-content-${cellIndex}`}>
                <IconButton
                    icon={cell ? "toggle-switch" : "toggle-switch-off-outline"}
                    size={spacing.large + 10}
                    iconColor={cell ? theme.colors.green : theme.colors.secondary}
                    disabled={Boolean(Canedit)}
                />
            </Pressable>
        );
    }

    return <Text key={`cell-content-${cellIndex}`} style={masterdataStyles.text}>{String(cell)}</Text>;
});

export default Cellcontent