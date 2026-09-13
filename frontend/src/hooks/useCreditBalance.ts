import { useQuery } from '@tanstack/react-query';

import api from '@/api/axios';

export function useCreditBalance() {
	return useQuery({
		queryKey: ['billing', 'balance'],
		queryFn: async () => {
			const response = await api.get<{ balance: number }>('/billing/balance');
			return response.data.balance;
		},
		staleTime: 15_000,
		refetchOnWindowFocus: true,
	});
}
