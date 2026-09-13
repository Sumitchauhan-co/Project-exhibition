import api from '@/api/axios';
import type { SystemOptionsConfig } from '@/types/configApi';

export async function fetchSystemOptions(): Promise<SystemOptionsConfig> {
	const response = await api.get<SystemOptionsConfig>('/config/options');
	return response.data;
}
