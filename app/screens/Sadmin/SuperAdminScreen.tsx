import React from "react";
import AccessibleView from "@/components/AccessibleView";
import Text from '@/components/Text'

const SuperAdminScreen = () => {

  return (
    <AccessibleView name="superadmin">
      <Text>Welcome SuperAdminScreen</Text>
    </AccessibleView>
  );
}

export default React.memo(SuperAdminScreen)