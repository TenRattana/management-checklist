import React, { useState, useCallback } from "react";
import { Pressable, ActivityIndicator } from "react-native";
import { Card, Text } from "react-native-paper";
import { useAuth } from "../../contexts/auth";
import { Formik } from "formik";
import * as Yup from "yup";
import { useFocusEffect } from "@react-navigation/native";
import { useToast } from "@/app/contexts/toastify";
import { AccessibleView, Inputs } from "@/components";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("The username field is required."),
});

const LoginScreen = () => {
  const { login } = useAuth();
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
    const result = await login(values);
    setLoading(false);
    result?.success ? handleSuccess() : handleError();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setInitialValues({ username: "" });
      };
    }, [])
  );

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
              <AccessibleView>
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

                <Pressable
                  onPress={() => handleSubmit()}
                  disabled={!isValid || !dirty || loading}
                >
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text>Login</Text>
                  )}
                </Pressable>
              </AccessibleView>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </AccessibleView>
  );
};

export default LoginScreen;
