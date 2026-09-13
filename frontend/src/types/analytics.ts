declare global {
	interface Window {
		dataLayer?: any[];
		gtag?: (...args: any[]) => void;
		posthog?: {
			opt_in_capturing: () => void;
			opt_out_capturing: () => void;
			[key: string]: any;
		};
	}
}

// Ensures TypeScript treats this file as a module block
export {};
