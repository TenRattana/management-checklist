import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import { StyleSheet } from "react-native";

const { theme } = useTheme();
const { responsive } = useRes();

export const styles = StyleSheet.create({
  container: {
    width: responsive === "large" ? 900 : "80%",
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 8
  },
  containerTime: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addButton: {
    marginVertical: 5,
  },
  slotContainer: {
    marginHorizontal: "2%",
    flexBasis: "46%",
  },
  timeButton: {
    marginVertical: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
  },
  deleteButton: {
    justifyContent: "center",
    alignSelf: "center",
    alignContent: "center",
    alignItems: "center",
  },
  timeIntervalMenu: {
    marginHorizontal: 20,
  },
  menuItem: {
    width: 200,
  },
  rightActionsContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 8,
  },
  dialog: {
    zIndex: 2,
    width: 500,
    justifyContent: "center",
    alignSelf: "center",
  },
  containerWeek: {
    flexDirection: 'row',
    marginHorizontal: 5,
    marginVertical: 5,
    justifyContent: 'space-between'
  },
  containerBoxWeek: {
    flexBasis: '45%',
    backgroundColor: theme.colors.blue,
    borderRadius: 8,
    justifyContent: 'center'
  },
  containerIconWeek: {
    flexBasis: '20%',
    borderRadius: 8,
    justifyContent: 'center',
    marginHorizontal: '2%',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    alignSelf: 'center'
  },
  actionButton: {
    marginHorizontal: 5,
    padding: 10
  },
});

export const convertToDate = (thaiDate: string): Date => {
  const parts = thaiDate.split(" ");
  const [day, month, year] = parts[0].split("-");
  const time = parts[1] || "00:00";

  const [hour, minute] = time.split(":");

  const gregorianYear = parseInt(year) - 543;

  const formattedDate = new Date(gregorianYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));

  return formattedDate;
};

export const convertToThaiDateTime = (
  dateString: string,
  showTime?: boolean
) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear() + 543;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return showTime
    ? `${day}-${month}-${year} ${hours}:${minutes}`
    : `${day}-${month}-${year}`;
};
