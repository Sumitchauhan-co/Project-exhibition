import { useQuery } from '@tanstack/react-query';

import api from '@/api/axios';
import useAuthStore from '@/store/store';
import type { User } from '@/types/user';

export function useAuthSession() {
	return useQuery({
		queryKey: ['auth', 'me'],
		queryFn: async () => {
			try {
				const response = await api.get<User>('/auth/me');
				useAuthStore.setState({
					user: response.data,
					isAuthenticated: true,
					isLoaded: true,
				});
				return response.data;
			} catch (error) {
				useAuthStore.setState({
					user: null,
					accessToken: null,
					isAuthenticated: false,
					isLoaded: true,
				});
				throw error;
			}
		},
		retry: false,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}
