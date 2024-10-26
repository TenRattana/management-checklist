import { Text } from "@/components";
import React from "react";

const ProblematicComponent: React.FC = () => {
    console.log("ProblematicComponent");

    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        try {
            throw new Error("This is a test error");
        } catch (e: any) {
            setError(e);
        }
    }, []);

    if (error) {
        return <Text>Error: {error.message}</Text>;
    }

    return <Text>This will render normally.</Text>;
};

export default ProblematicComponent