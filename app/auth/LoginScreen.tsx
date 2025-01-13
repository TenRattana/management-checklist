import React, { useCallback, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { Field, Formik } from "formik";
import * as Yup from "yup";
import Inputs from "@/components/common/Inputs"
import Text from "@/components/Text"
import useMasterdataStyles from "@/styles/common/masterdata";
import { useAuth } from "@/app/contexts/useAuth";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { useTheme } from "@/app/contexts/useTheme";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("The username field is required."),
  password: Yup.string().required("The password field is required."),
});

const LoginScreen: React.FC = React.memo(() => {

  const { handleError } = useToast();
  const { login } = useAuth();
  const { spacing, fontSize, responsive } = useRes();
  const { theme } = useTheme();
  const masterdataStyles = useMasterdataStyles();

  const handleLogin = useCallback((values: { username: string, password: string }) => {
    try {
      login(values.username, values.password);
    } catch (error) {
      handleError(error);
    }
  }, [login, handleError]);

  const styles = StyleSheet.create({
    container: {
      alignContent: 'center',
      justifyContent: 'center',
      height: '100%',
    }
  })

  return (
    <View id="login-container" style={[masterdataStyles.container, styles.container]}>
      <Card style={[masterdataStyles.containerDialog, { alignSelf: 'center', padding: 20 }]}>
        <Text style={[masterdataStyles.text, masterdataStyles.title, masterdataStyles.textBold, { paddingLeft: 8 }]}>Login</Text>

        <Card.Content style={{ padding: 2, paddingVertical: 10 }}>

          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={validationSchema}
            validateOnBlur={false}
            onSubmit={handleLogin}
          >
            {({
              handleSubmit,
              isValid,
              dirty,
            }) => {
              const buttonStyle = useMemo(() => {
                return [
                  masterdataStyles.button,
                  masterdataStyles.backMain,
                  { opacity: isValid && dirty ? 1 : 0.5 }
                ];
              }, [isValid, dirty]);

              return (
                <View id="login">

                  <Field name="username">
                    {({ field, form }: any) => (
                      <>
                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 20, paddingLeft: 10 }]}>
                          Username
                        </Text>

                        <Inputs
                          mode="outlined"
                          placeholder="Enter Username"
                          label="Username"
                          handleChange={(value) => form.setFieldValue(field.name, value)}
                          handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                          value={field.value}
                          error={form.touched.username && Boolean(form.errors.username)}
                          errorMessage={form.touched.username ? form.errors.username : ""}
                          name="username"
                          testId="username"
                        />
                      </>
                    )}
                  </Field>

                  <Field name="password">
                    {({ field, form }: any) => (
                      <>
                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 5, paddingLeft: 10 }]}>
                          Password
                        </Text>

                        <Inputs
                          mode="outlined"
                          placeholder="Enter Password"
                          label="Password"
                          handleChange={(value) => form.setFieldValue(field.name, value)}
                          handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                          value={field.value}
                          error={form.touched.password && Boolean(form.errors.password)}
                          errorMessage={form.touched.password ? form.errors.password : ""}
                          secureTextEntry={true}
                          name="password"
                          testId="password"
                        />
                      </>
                    )}
                  </Field>

                  <View id="action-login" style={{ justifyContent: 'center', alignItems: 'center' }}>

                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={!isValid || !dirty}
                      style={buttonStyle}
                    >
                      <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Login</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            }}
          </Formik>
        </Card.Content>
      </Card>
    </View>
  );
});

export default LoginScreen;
