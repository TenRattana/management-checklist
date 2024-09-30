import axios, { AxiosError } from "axios";
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || "https://default.api.com";

axios.defaults.baseURL = API_URL;
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('Server responded with status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
