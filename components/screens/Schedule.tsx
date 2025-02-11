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
    marginVertical: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    alignSelf: 'flex-end',
    marginRight: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: "center",
    backgroundColor: theme.colors.drag,
    borderRadius: 4,
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
    marginHorizontal: 5,
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
    margin: 5,
    padding: 10
  },
});

export const convertToDate = (thaiDate: string, type?: boolean): Date => {
  const parts = thaiDate.split(" ");
  const [day, month, year] = parts[0].split("-");
  const time = parts[1] || type ? "23:59" : "00:00";

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

export const convertToDateTime = (
  dateString: string
) => {
  const [day, month, thaiYear] = dateString.split('-');

  const gregorianYear = parseInt(thaiYear) - 543;

  return `${gregorianYear}-${month}-${day}`;
};

export const parseDateFromString = (dateString: string): Date | null => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4}) เวลา (\d{2}):(\d{2})$/;
  const match = dateString.match(regex);

  if (match) {
    const day = match[1];
    const month = match[2];
    const year = match[3];
    const hour = match[4];
    const minute = match[5];

    const gregorianYear = parseInt(year) - 543;

    const validDateString = `${gregorianYear}-${month}-${day}T${hour}:${minute}:00`;

    const date = new Date(validDateString);

    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};