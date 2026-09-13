import axios from 'axios';

import { toast } from '../components/ui/toast';
import { persistPaymentGuard } from '../hooks/usePaymentGuard';
import useAuthStore from '../store/store';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1`;
const PAYMENT_GUARD_KEY = 'payment_guard_reason';

const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		'ngrok-skip-browser-warning': 'true',
	},
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const normalizePaymentDetail = (detail: unknown): Record<string, unknown> => {
	if (typeof detail === 'string') {
		return { message: detail };
	}

	if (detail && typeof detail === 'object') {
		return detail as Record<string, unknown>;
	}

	return {
		message: 'Your account does not have enough credits for this action.',
	};
};

const getSuccessMessage = (config: { method?: string; url?: string }): string => {
	const method = (config.method ?? 'GET').toUpperCase();
	const url = config.url ?? '';

	if (url.includes('/auth/signin')) {
		return 'Signed in successfully.';
	}
	if (url.includes('/auth/signup')) {
		return 'Account created successfully.';
	}
	if (url.includes('/auth/signout')) {
		return 'Signed out successfully.';
	}
	if (url.includes('/billing')) {
		return 'Payment request processed successfully.';
	}
	if (url.includes('/contact/submit')) {
		return 'Your message has been sent successfully.';
	}
	if (url.includes('/evaluation')) {
		return 'Benchmark analysis has started.';
	}
	if (method === 'POST') {
		return 'Request completed successfully.';
	}
	if (method === 'DELETE') {
		return 'Item removed successfully.';
	}
	if (method === 'PUT' || method === 'PATCH') {
		return 'Changes saved successfully.';
	}

	return 'Data refreshed successfully.';
};

const shouldNotifySuccess = (config: { method?: string; url?: string }): boolean => {
	const method = (config.method ?? 'GET').toUpperCase();
	const url = config.url ?? '';

	if (url.includes('/auth/refresh')) {
		return false;
	}
	if (url.includes('/auth/me')) {
		return false;
	}
	if (method === 'GET' && !url.includes('/dashboard') && !url.includes('/contact')) {
		return false;
	}

	return true;
};

const onRefreshed = (token: string) => {
	refreshSubscribers.forEach((callback) => callback(token));
	refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string> => {
	try {
		const response = await axios.post<{ access_token: string }>(
			`${API_BASE_URL}/auth/refresh`,
			{},
			{
				withCredentials: true,
				headers: {
					'ngrok-skip-browser-warning': 'true',
				},
			},
		);

		const nextToken = response.data.access_token;
		useAuthStore.getState().setAccessToken(nextToken);
		onRefreshed(nextToken);
		return nextToken;
	} catch (error) {
		useAuthStore.getState().clearAuth();
		if (
			typeof window !== 'undefined' &&
			!window.location.pathname.startsWith('/signin') &&
			!window.location.pathname.startsWith('/signup')
		) {
			window.location.assign('/signin');
		}
		throw error;
	}
};

api.interceptors.request.use((config) => {
	const token = useAuthStore.getState().accessToken;
	if (token && !config.headers.Authorization) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => {
		const config = response.config as { method?: string; url?: string };
		if (response.status >= 200 && response.status < 300 && shouldNotifySuccess(config)) {
			toast.add({
				title: 'Success',
				description: getSuccessMessage(config),
				type: 'success',
				timeout: 4200,
			});
		}
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		if (!originalRequest || originalRequest._retry) {
			return Promise.reject(error);
		}

		const isAuthRoute =
			originalRequest.url?.includes('/auth/signin') ||
			originalRequest.url?.includes('/auth/signup') ||
			originalRequest.url?.includes('/auth/refresh');

		if (error.response?.status === 402 && !isAuthRoute) {
			const detail = error.response?.data?.detail;
			const normalized = normalizePaymentDetail(detail);
			const message =
				(typeof normalized.message === 'string' && normalized.message) ||
				'Your available credits are too low for this run. Please add credits to continue.';

			persistPaymentGuard(normalized);

			toast.add({
				title: 'Payment required',
				description: message,
				type: 'warning',
				timeout: 7000,
			});

			if (
				typeof window !== 'undefined' &&
				window.location.pathname !== '/payment'
			) {
				window.location.assign('/payment');
			}
			return Promise.reject(error);
		}

		if (error.response?.status === 401 && !isAuthRoute) {
			originalRequest._retry = true;

			if (!isRefreshing) {
				isRefreshing = true;
				try {
					const token = await refreshAccessToken();
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return api(originalRequest);
				} finally {
					isRefreshing = false;
				}
			}

			return new Promise((resolve) => {
				refreshSubscribers.push((token: string) => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					resolve(api(originalRequest));
				});
			}).catch((retryError) => {
				return Promise.reject(retryError);
			});
		}

		if (error.response?.status === 401 && isAuthRoute) {
			toast.add({
				title: 'Session expired',
				description: 'Please sign in again to continue.',
				type: 'warning',
				timeout: 5000,
			});
		}

		if (error.response) {
			
			const detail =
			error.response?.data?.detail ?? 'Something went wrong. Please try again.';
			const message = detail.message || 'Something went wrong. Please try again.';

			toast.add({
				title: 'Request failed',
				description: message,
				type: 'error',
				timeout: 6000,
			});
		}

		return Promise.reject(error);
	},
);

export { PAYMENT_GUARD_KEY };
export default api;
