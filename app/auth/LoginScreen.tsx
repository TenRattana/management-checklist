import React, { useCallback, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { Card } from "react-native-paper";
import { FastField, Formik } from "formik";
import * as Yup from "yup";
import AccessibleView from "@/components/AccessibleView"
import Inputs from "@/components/common/Inputs"
import Text from "@/components/Text"
import useMasterdataStyles from "@/styles/common/masterdata";
import { useAuth } from "@/app/contexts/useAuth";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("The username field is required."),
  password: Yup.string().required("The password field is required."),
});

const LoginScreen: React.FC = React.memo(() => {

  const { handleError } = useToast();
  const { login } = useAuth();
  const { spacing, fontSize, responsive } = useRes();
  const masterdataStyles = useMasterdataStyles();

  const handleLogin = useCallback((values: { username: string, password: string }) => {
    try {
      login(values.username, values.password);
    } catch (error) {
      handleError(error);
    }
  }, [login, handleError]);

  return (
    <AccessibleView name="login-container" style={[masterdataStyles.container, { alignContent: 'center', justifyContent: 'center', height: '100%' }]}>
      <Card style={{ width: responsive === "large" ? 500 : responsive === "medium" ? '60%' : "80%", alignSelf: 'center' }}>
        <Card.Title
          title={`Login`}
          titleStyle={[masterdataStyles.textBold, { fontSize: spacing.small, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
        />
        <Card.Content style={{ padding: 2, paddingVertical: 10 }}>

          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={validationSchema}
            validateOnBlur={true}
            validateOnChange={false}
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

                  <FastField name="username">
                    {({ field, form }: any) => (
                      <Inputs
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
                    )}
                  </FastField>

                  <FastField name="password">
                    {({ field, form }: any) => (
                      <Inputs
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
                    )}
                  </FastField>

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
    </AccessibleView>
  );
});

export default LoginScreen;
