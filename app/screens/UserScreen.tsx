import React from "react";
import { AccessibleView , Text} from "@/components";

const UserScreen = () => {

  return (
    <AccessibleView name="user">
      <Text>User Dashboard</Text>
    </AccessibleView>
  );
};

export default React.memo(UserScreen)

