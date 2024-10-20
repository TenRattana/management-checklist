export const palette = {
  main: "#1ec9ff",
  disable: "#d0d0d0",
  primary: "#6200ee",
  secondary: "#03dac6",
  secondary2: "#02dac6",
  background: "#f6f6f6",
  background2: "#4f4f4f",
  gray90: "#909090",
  light: "#ffffff",
  error: "#b00020",
  dark: "#000000",
  dark4: "#2e2e2e",
  warning: "rgba(255, 193, 7, 1)",
  danger: "rgba(214, 61, 57, 1)",
  primaryLight: "rgba(90, 154, 230, 1)",
  transparent: "rgba(100, 100, 100, 0.5)",
  blue: "rgb(20, 148, 255)",
  green: "#ffb11e",
  yellow: "#bea400",
};

export const colors = {
  palette,
  text: palette.dark,
  background: palette.background,
  error: palette.error,
  warning: palette.warning,
  danger: palette.danger,
  main: palette.main,
  light: palette.light,
  dark: palette.dark,
  dark4: palette.dark4,
  disable: palette.disable,
  succeass: palette.green,
  yellow: palette.yellow,
};

export const dark = {
  background: palette.dark4,
  color: palette.light,
  seconColor: palette.danger
}

export const light = {
  background: palette.light,
  color: palette.dark,
  seconColor: palette.blue
}
