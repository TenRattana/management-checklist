import axios from "axios";

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://default.api.com";

const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    },
});

export default axiosInstance;
