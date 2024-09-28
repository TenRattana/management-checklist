import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Card, Text } from "react-native-paper";
import { useAuth } from "../../contexts/auth";
import { Formik } from "formik";
import * as Yup from "yup";
import { useFocusEffect } from "@react-navigation/native";
import Inputs from "@/components/common/Inputs";
import { useRes } from "@/app/contexts/responsive";
import { useTheme } from "@/app/contexts/theme";
import { useToast } from "@/app/contexts/toastify";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("The username field is required."),
});

const LoginScreen = () => {
  const { login } = useAuth();
  const { colors, fonts, spacing } = useTheme();
  const { responsive } = useRes();
  const { showSuccess, showError } = useToast();
  const [initialValues, setInitialValues] = useState({
    username: "",
  });

  const handleSuccess = useCallback(() => {
    showSuccess("Operation was successful!");
  }, []);

  const handleError = useCallback(() => {
    showError("There was an error!");
  }, []);

  const handleLogin = useCallback((values) => {
    const result = login(values)?.success ?? false;
    result ? handleSuccess() : handleError();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setInitialValues({
          username: "",
        });
      };
    }, [])
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.md,
    },
    card: {
      padding: spacing.md,
    },
    input: {
      marginBottom: spacing.md,
    },
    text: {
      fontSize: responsive === "small" ? fonts.xsm : fonts.md,
      color: colors.text,
      textAlign: "left",
    },
    textBold: {
      fontSize: responsive === "small" ? fonts.lg : fonts.lgx,
      fontWeight: "bold",
    },
    textMain: {
      color: colors.main,
    },
    textLight: {
      color: colors.light,
    },
    textDark: {
      color: colors.dark,
    },
    textError: {
      color: colors.danger,
    },
    containerFlexStyle: {
      flexDirection: "row",
      flexWrap: "wrap",
      padding: spacing.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      width: `${
        responsive === "small" ? 98 : responsive === "medium" ? 80 / 2 : 75 / 4
      }%`,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: "1%",
      marginHorizontal: "3%",
      textAlign: "center",
      height: 40,
      borderRadius: spacing.xsm,
    },
    backMain: {
      backgroundColor: colors.main,
    },
    backLight: {
      backgroundColor: colors.palette.light,
    },
    backDis: {
      backgroundColor: colors.disable,
    },
  });

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Login" />
        <Card.Content>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            validateOnBlur={false}
            validateOnChange={true}
            onSubmit={(values) => {
              handleLogin(values);
            }}
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
              <View>
                <Inputs
                  placeholder="Enter Username"
                  label="Username"
                  handleChange={handleChange("username")}
                  handleBlur={handleBlur("username")}
                  value={values.username}
                  error={touched.username && Boolean(errors.username)}
                  errorMessage={touched.username ? errors.username : ""}
                />

                <View style={styles.containerFlexStyle}>
                  <Pressable
                    onPress={handleSubmit}
                    style={[
                      styles.button,
                      isValid && dirty ? styles.backMain : styles.backDis,
                    ]}
                    disabled={!isValid || !dirty}
                  >
                    <Text
                      style={[styles.textBold, styles.text, styles.textLight]}
                    >
                      Login
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </View>
  );
};

export default LoginScreen;
