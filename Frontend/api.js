import axios from 'axios';

// Render free tier cold-start can take up to 60 seconds.
// We set timeout to 70s and fire a custom event after 3s of waiting
// so the UI can show a "Server is waking up..." banner.

const COLD_START_THRESHOLD_MS = 3000; // show banner after 3s
const RENDER_TIMEOUT_MS = 70000;       // give Render up to 70s to respond

const API = axios.create({
    baseURL: 'https://ecom-02-s5g5.onrender.com/api',
    timeout: RENDER_TIMEOUT_MS,
});

// Track in-flight requests count for wakeup banner logic
let activeRequests = 0;
let wakeupTimer = null;

const dispatchWakeup = (type) => window.dispatchEvent(new CustomEvent('render-wakeup', { detail: { type } }));

// Add a request interceptor to include the auth token in headers
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Start wakeup timer on first active request
        activeRequests++;
        if (activeRequests === 1 && !wakeupTimer) {
            wakeupTimer = setTimeout(() => {
                dispatchWakeup('show');
            }, COLD_START_THRESHOLD_MS);
        }

        return config;
    },
    (error) => {
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0) {
            if (wakeupTimer) {
                clearTimeout(wakeupTimer);
                wakeupTimer = null;
            }
            dispatchWakeup('hide');
        }
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
API.interceptors.response.use(
    (response) => {
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0) {
            if (wakeupTimer) {
                clearTimeout(wakeupTimer);
                wakeupTimer = null;
            }
            dispatchWakeup('hide');
        }
        return response;
    },
    (error) => {
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0) {
            if (wakeupTimer) {
                clearTimeout(wakeupTimer);
                wakeupTimer = null;
            }
            dispatchWakeup('hide');
        }

        // If the error is 401 (Unauthorized) and it's not from a login or register request
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath.includes('/Login') || currentPath.includes('/Register') || currentPath.includes('/admin-login');

            if (!isAuthPage) {
                console.warn('Session expired or invalid. Clearing auth data.');
                // Clear authentication data from both storages
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('userRole');
                sessionStorage.removeItem('loginTime');

                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                localStorage.removeItem('loginTime');
            }
        }
        return Promise.reject(error);
    }
);

export default API;
