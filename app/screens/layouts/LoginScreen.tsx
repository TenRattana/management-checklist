import React, { useState, useCallback } from "react";
import { Pressable, ActivityIndicator } from "react-native";
import { Card } from "react-native-paper";
import { useAuth } from "../../contexts/auth";
import { Formik } from "formik";
import * as Yup from "yup";
import { useToast } from "@/app/contexts/toastify";
import { AccessibleView, Inputs ,Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useFocusEffect } from "expo-router";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("The username field is required."),
});

const LoginScreen = () => {
  const { showSuccess, showError } = useToast();
  const [initialValues, setInitialValues] = useState({ username: "" });
  const [loading, setLoading] = useState(false);

  const handleSuccess = useCallback(() => {
    showSuccess("Operation was successful!");
  }, []);

  const handleError = useCallback(() => {
    showError(["There was an error!"]);
  }, []);

  const handleLogin = useCallback(async (values: { username: string }) => {
    setLoading(true);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setInitialValues({ username: "" });
      };
    }, [])
  );
  const masterdataStyles = useMasterdataStyles()

  return (
    <AccessibleView name="Login Screen">
      <Card>
        <Card.Title title="Login" />
        <Card.Content>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            validateOnBlur={false}
            validateOnChange={true}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              values,
              errors,
              touched,
              handleSubmit,
              isValid,
              dirty,
            }) => (
              <AccessibleView name="login">
                <Inputs
                  placeholder="Enter Username"
                  label="Username"
                  handleChange={handleChange("username")}
                  handleBlur={handleBlur("username")}
                  value={values.username}
                  error={touched.username && Boolean(errors.username)}
                  errorMessage={touched.username ? errors.username : ""}
                  name="username"
                />

                <AccessibleView name="login-action">
                  <Pressable
                    onPress={() => handleSubmit()}
                    disabled={!isValid || !dirty || loading}
                    style={[
                      masterdataStyles.button,
                      isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis,
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator />
                    ) : (
                      <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Login</Text>
                    )}
                  </Pressable>
                </AccessibleView>
              </AccessibleView>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </AccessibleView>
  );
};

export default React.memo(LoginScreen);
