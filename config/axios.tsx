import axios, { AxiosError } from "axios";
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || "https://default.api.com";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// axiosInstance.interceptors.response.use(
//   response => response,
//   (error: AxiosError) => {
//     let errorMessage = 'An unknown error occurred';
//     if (error.response) {
//       switch (error.response.status) {
//         case 400:
//           errorMessage = 'Bad request. Please check your input.';
//           break;
//         case 404:
//           errorMessage = 'Requested resource not found.';
//           break;
//         case 500:
//           errorMessage = 'Server error. Please try again later.';
//           break;
//         default:
//           errorMessage = 'An error occurred. Please try again.';
//           break;
//       }
//     }
//     return Promise.reject(new Error(errorMessage));
//   }
// );

export default axiosInstance;
