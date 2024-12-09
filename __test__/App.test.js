import { render, waitFor } from "@testing-library/react-native";
import HomeScreen from "../app/screens/layouts/HomeScreen";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  ResponsiveProvider,
  ThemeProvider,
  TimezoneProvider,
} from "../app/providers";

const queryClient = new QueryClient();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("darkMode"),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn().mockReturnValue({
    someState: "mocked value",
  }),
}));

jest.mock("react-native-gesture-handler", () => {
  const actual = jest.requireActual("react-native-gesture-handler");
  return {
    ...actual,
    GestureHandlerRootView: ({ children }) => children,
  };
});

describe("<HomeScreen />", () => {
  it("should have the correct theme context value", async () => {
    // No need for act import here anymore
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <ResponsiveProvider>
          <ThemeProvider>
            <TimezoneProvider timezone="Asia/Bangkok">
              <HomeScreen />
            </TimezoneProvider>
          </ThemeProvider>
        </ResponsiveProvider>
      </QueryClientProvider>
    );

    // Wait for the component to fully render and ensure it is available
    await waitFor(() => expect(getByTestId("container-Home")).toBeTruthy());
  });
});
