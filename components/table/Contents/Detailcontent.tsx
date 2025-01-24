import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import useMasterdataStyles from "@/styles/common/masterdata";
import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import Text from "@/components/Text";
import { DetailContentProps } from "@/typing/screens/CustomTable";

const DetailContent = React.memo(({ detailData, showDetailwithKey }: DetailContentProps) => {
    const { spacing } = useRes();
    const { theme, darkMode } = useTheme()

    const masterdataStyles = useMasterdataStyles()

    const styles = StyleSheet.create({
        containerDetail: {
            flex: 1,
            marginTop: 10,
            borderRadius: 8,
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
            flex: 1,
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
            flex: 1,
            flexWrap: 'wrap',
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

    const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

    const convertToThaiDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear() + 543;
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} เวลา ${hours}:${minutes}`;
    };

    const renderValue = useCallback((value: any) => {
        if (Array.isArray(value)) {
            return (
                <View style={styles.chipContainer} key={`container-rendervalue`}>
                    {value.map((item, index) => (
                        <View key={`chip-${index}`} style={styles.chip}>
                            <Text style={styles.chipText}>{renderValue(item)}</Text>
                        </View>
                    ))}
                </View>
            );
        } else if (typeof value === "object" && value !== null) {
            return (
                <View style={styles.nestedObjectContainer} key={`container-object`}>
                    {Object.entries(value).map(([subKey, subValue]) => (
                        <View style={styles.nestedRow} key={`${subKey}-subvalue-${subValue}`}>
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
            return <Text style={masterdataStyles.text}>{String(datePattern.test(value) ? convertToThaiDateTime(value) : value)}</Text>;
        }
    }, []);

    const renderDetails = useCallback(() => {
        if (!detailData || detailData.length === 0) {
            return (
                <View style={styles.emptyState} key={`container-renderdetail`}>
                    <Text style={styles.emptyStateText}>No data available</Text>
                </View>
            );
        }

        return (
            <View style={styles.containerDetail} key={`container-${detailData}`}>
                {Object.entries(detailData).map(([key, value]) => showDetailwithKey && showDetailwithKey.includes(key) && value !== null && (
                    <View style={styles.detailRowItem} key={`${key}-value-${value}`}>
                        <Text style={[masterdataStyles.text, styles.keyText]}>
                            {`${key.charAt(0).toUpperCase() + key.slice(1)}:`}
                        </Text>

                        {renderValue(value)}
                    </View>
                ))}
            </View>
        );
    }, [detailData, showDetailwithKey, darkMode]);

    return <View>{renderDetails()}</View>;
});

export default DetailContent;
