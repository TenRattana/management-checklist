import React, { useState, useCallback } from "react";
import { Pressable, ActivityIndicator, View } from "react-native";
import { Card } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { AccessibleView, Inputs, Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useFocusEffect } from "expo-router";
import { useAuth, useRes, useTheme, useToast } from "@/app/contexts";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("The username field is required."),
});

const LoginScreen: React.FC = React.memo(() => {
  const { handleError } = useToast();
  const { login } = useAuth();
  const { spacing, fontSize } = useRes();
  const { theme } = useTheme();
  const masterdataStyles = useMasterdataStyles();
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (values: { username: string, password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [login, handleError]);

  useFocusEffect(
    useCallback(() => {
      return () => { };
    }, [])
  );

  return (
    <AccessibleView name="login-container" style={{ flex: 1, paddingHorizontal: 30, backgroundColor: theme.colors.onBackground }}>
      <Card style={{ height: 250, marginTop: 100, marginHorizontal: 50 }}>
        <Card.Title
          title="Login"
          titleStyle={[masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
        />
        <Card.Content style={{ padding: 2, paddingVertical: 10 }}>

          <Formik
            initialValues={{ username: "", password: "" }}
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
                  handleChange={handleChange("username") as any}
                  handleBlur={handleBlur("username")}
                  value={values.username}
                  error={touched.username && Boolean(errors.username)}
                  errorMessage={touched.username ? errors.username : ""}
                  name="username"
                  testId="username"
                />

                <Inputs
                  placeholder="Enter Password"
                  label="Password"
                  handleChange={handleChange("password") as any}
                  handleBlur={handleBlur("password")}
                  value={values.password}
                  error={touched.password && Boolean(errors.password)}
                  errorMessage={touched.password ? errors.password : ""}
                  name="password"
                  testId="password"
                />

                <View id="action-login" style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Pressable
                    onPress={() => handleSubmit()}
                    disabled={!isValid || !dirty || loading}
                    style={[
                      masterdataStyles.button,
                      masterdataStyles.backMain,
                      { opacity: isValid && dirty ? 1 : 0.5 }
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator />
                    ) : (
                      <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Login</Text>
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
});

export default LoginScreen;
