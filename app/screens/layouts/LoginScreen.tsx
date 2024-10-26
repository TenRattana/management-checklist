import React, { useState, useCallback } from "react";
import { Pressable, ActivityIndicator, View } from "react-native";
import { Card } from "react-native-paper";
import { useAuth } from "../../contexts/auth";
import { Formik } from "formik";
import * as Yup from "yup";
import { useToast } from "@/app/contexts/toastify";
import { AccessibleView, Inputs, Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useFocusEffect } from "expo-router";
import { useRes } from "@/app/contexts";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("The username field is required."),
});

const LoginScreen = () => {
  const { handleError } = useToast();
  const [initialValues, setInitialValues] = useState({ username: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth()
  const { spacing } = useRes();
  const masterdataStyles = useMasterdataStyles()

  const handleLogin = useCallback(async (values: { username: string }) => {
    setLoading(true);
    try {
      login(values.username)
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setInitialValues({ username: "" });
      };
    }, [])
  );

  return (
    <AccessibleView name="Login Screen" style={{ paddingHorizontal: 30, marginTop: 100 }}>
      <Card style={[{ height: 250 }]}>
        <Card.Title title="Login"
          titleStyle={[masterdataStyles.text, masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small - 10 }]}
        />
        <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
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
              <View id="login">
                <Inputs
                  placeholder="Enter Username"
                  label="Username"
                  handleChange={handleChange("username")}
                  handleBlur={handleBlur("username")}
                  value={values.username}
                  error={touched.username && Boolean(errors.username)}
                  errorMessage={touched.username ? errors.username : ""}
                  name="username"
                  testId="username"
                />

                <View id="login-action" style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Pressable
                    onPress={() => handleSubmit()}
                    disabled={!isValid || !dirty || loading}
                    style={[isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis, masterdataStyles.buttonCreate]}
                  >
                    {loading ? (
                      <ActivityIndicator />
                    ) : (
                      <Text style={[masterdataStyles.textBold, { textAlign: 'center' }]}>Login</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </AccessibleView>
  );
};

export default React.memo(LoginScreen);
