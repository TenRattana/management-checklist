import moment from "moment-timezone";

const DEFAULT_TIMEZONE = "Asia/Bangkok";

/**
 * Get the current time in the default timezone.
 * @returns {string} - Current time formatted as "YYYY-MM-DD HH:mm:ss".
 */
export const getCurrentTime = (): Date => {
    return moment().tz(DEFAULT_TIMEZONE).toDate();
};

/**
 * Convert a UTC date to the default timezone.
 * @param utcDate - The UTC date to be converted (string or Date).
 * @returns {string} - The converted date in the format "YYYY-MM-DD HH:mm:ss".
 */
export const convertToDefaultTimezone = (utcDate: string | Date): string => {
    return moment.utc(utcDate).tz(DEFAULT_TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
};

/**
 * Format a given date in the default timezone.
 * @param date - The date to be formatted (string or Date).
 * @param format - The desired format (default is "YYYY-MM-DD HH:mm:ss").
 * @returns {string} - The formatted date in the default timezone.
 */
export const formatTime = (date: string | Date, format: string = "YYYY-MM-DD HH:mm:ss"): string => {
    return moment(date).tz(DEFAULT_TIMEZONE).format(format);
};
