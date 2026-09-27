import { create } from 'zustand';
import api from '../api/axios';
import type { User } from '@/types/user';

interface AuthState {
	user: User | null;
	accessToken: string | null;
	isAuthenticated: boolean;
	isLoaded: boolean;
	creditBalance: number | null;
	setAccessToken: (token: string | null) => void;
	setUser: (user: User | null) => void;
	fetchBalance: () => Promise<void>;
	signin: (email: string, password: string) => Promise<void>;
	googleSignin: (idToken: string) => Promise<void>;
	signup: (fullName: string, email: string, password: string) => Promise<void>;
	signout: () => Promise<void>;
	getUser: () => Promise<void>;
	clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	accessToken: null,
	isAuthenticated: false,
	isLoaded: false,
	creditBalance: null,

	setAccessToken: (token) =>
		set({ accessToken: token, isAuthenticated: !!token }),

	setUser: (user) => set({ user, isAuthenticated: !!user }),

	fetchBalance: async () => {
		if (!get().isAuthenticated) return;
		try {
			const response = await api.get<{ balance: number }>('/billing/balance');
			set({ creditBalance: response.data.balance });
		} catch (error) {
			console.error('Failed to load credit balance', error);
			set({ creditBalance: null });
		}
	},

	signin: async (email, password) => {
		const res = await api.post<{ access_token: string }>('/auth/signin', {
			email,
			password,
		});

		set({ accessToken: res.data.access_token, isAuthenticated: true });
		await get().getUser();
	},

	googleSignin: async (idToken) => {
		const res = await api.post<{ access_token: string }>('/auth/google', {
			id_token: idToken,
		});

		set({ accessToken: res.data.access_token, isAuthenticated: true });
		await get().getUser();
	},

	signup: async (fullName, email, password) => {
		await api.post('/auth/signup', {
			full_name: fullName,
			email,
			password,
		});
		await get().signin(email, password);
	},

	signout: async () => {
		try {
			await api.post('/auth/signout');
		} catch (error) {
			console.error('Signout error:', error);
		} finally {
			get().clearAuth();
		}
	},

	getUser: async () => {
		try {
			const response = await api.get<User>('/auth/me');
			set({
				user: response.data,
				isAuthenticated: true,
				isLoaded: true,
			});
			void get().fetchBalance();
		} catch (error) {
			console.log(error);

			set({
				user: null,
				accessToken: null,
				isAuthenticated: false,
				isLoaded: true,
				creditBalance: null,
			});
		}
	},

	clearAuth: () =>
		set({
			user: null,
			accessToken: null,
			isAuthenticated: false,
			isLoaded: true,
			creditBalance: null,
		}),
}));

export default useAuthStore;
