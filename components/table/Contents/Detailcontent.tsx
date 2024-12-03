import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import useMasterdataStyles from "@/styles/common/masterdata";
import React, { useCallback, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

type DetailContentProps = {
    detailData: any[];
    isDetailVisible: boolean;
};

const DetailContent = ({ detailData }: DetailContentProps) => {
    useEffect(() => { }, [detailData])
    const { spacing } = useRes();
    const { theme } = useTheme()

    const masterdataStyles = useMasterdataStyles()

    const styles = StyleSheet.create({
        containerDetail: {
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
        },
        detailRow: {
            marginBottom: 15,
        },
        detailRowItem: {
            marginBottom: 8,
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
        },
        keyText: {
            marginRight: 5,
            alignSelf: 'center'
        },
        chipContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        chip: {
            backgroundColor: theme.colors.onSecondary,
            borderRadius: 16,
            paddingHorizontal: 10,
            paddingVertical: 5,
            marginRight: 5,
        },
        chipText: {
            fontSize: spacing.small,
            color: theme.colors.fff,
        },
        nestedObjectContainer: {
            paddingHorizontal: 5,
            borderLeftWidth: 2,
            borderLeftColor: "#eee",
        },
        nestedRow: {
            flexDirection: "row",
            marginBottom: 5,
        },
        emptyState: {
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
        },
        emptyStateText: {
            fontSize: spacing.small,
            color: "#999",
        },
    })

    const renderValue = useCallback((value: any) => {
        if (Array.isArray(value)) {
            return (
                <View style={styles.chipContainer}>
                    {value.map((item, index) => (
                        <View key={`chip-${index}`} style={styles.chip}>
                            <Text style={styles.chipText}>{renderValue(item)}</Text>
                        </View>
                    ))}
                </View>
            );
        } else if (typeof value === "object" && value !== null) {
            return (
                <View style={styles.nestedObjectContainer}>
                    {Object.entries(value).map(([subKey, subValue]) => (
                        <View style={styles.nestedRow} key={subKey}>
                            <Text style={[masterdataStyles.text, styles.keyText]}>
                                {`${subKey.charAt(0).toUpperCase() + subKey.slice(1)}:`}
                            </Text>
                            {renderValue(subValue)}
                        </View>
                    ))}
                </View>
            );
        } else if (typeof value === "boolean" && value !== null) {
            return <Text style={masterdataStyles.text}>{value ? "Active" : "Is Active"}</Text>;
        } else {
            return <Text style={masterdataStyles.text}>{String(value)}</Text>;
        }
    }, []);

    const renderDetails = useCallback(() => {
        if (!detailData || detailData.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No data available</Text>
                </View>
            );
        }

        return (
            <View style={styles.containerDetail}>
                <View style={styles.detailRow}>
                    {Object.entries(detailData).map(([key, value]) => (
                        <View style={styles.detailRowItem} key={key}>
                            <Text style={[masterdataStyles.text, styles.keyText]}>
                                {`${key.charAt(0).toUpperCase() + key.slice(1)}:`}
                            </Text>
                            {renderValue(value)}
                        </View>
                    ))}
                </View>
            </View>
        );
    }, [detailData]);

    return <View>{renderDetails()}</View>;
};

export default DetailContent;
