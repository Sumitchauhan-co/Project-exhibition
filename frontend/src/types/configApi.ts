export interface OptionItem {
	id: string;
	label: string;
	description: string;
}

export interface SystemOptionsConfig {
	strategies: OptionItem[];
	llms: OptionItem[];
	embeddings: OptionItem[];
}
