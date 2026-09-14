import api from '../api/axios';
import type {
	CreditBalanceResponse,
	PaymentOrderResponse,
	PaymentPackageOption,
} from '../types/payment';

interface RazorpaySuccessResponse {
	razorpay_payment_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
}

declare global {
	interface Window {
		Razorpay?: new (options: Record<string, any>) => {
			open: () => void;
		};
	}
}

export const PAYMENT_PACKAGES: PaymentPackageOption[] = [
	{
		id: 'starter_pack',
		label: 'Starter Pack',
		amount: 100,
		credits: 1000,
		description: 'Perfect for first-time users and quick testing.',
	},
	{
		id: 'pro_pack',
		label: 'Pro Pack',
		amount: 500,
		credits: 6000,
		description: 'Built for regular benchmark workloads and teams.',
	},
	{
		id: 'enterprise_pack',
		label: 'Enterprise Pack',
		amount: 2000,
		credits: 30000,
		description: 'High-volume usage with a larger benchmark budget.',
	},
];

export const MINIMUM_CUSTOM_CREDITS = 100;
export const MAXIMUM_CUSTOM_CREDITS = 100000;

export const fetchCreditBalance = async (): Promise<CreditBalanceResponse> => {
	const response = await api.get<CreditBalanceResponse>('/billing/balance');
	return response.data;
};

export const createBillingOrder = async (payload: {
	package_id?: string;
	credits?: number;
}): Promise<PaymentOrderResponse> => {
	if (payload.credits !== undefined) {
		if (payload.credits < MINIMUM_CUSTOM_CREDITS) {
			throw new Error(`Minimum purchase is ${MINIMUM_CUSTOM_CREDITS} credits.`);
		}
		if (payload.credits > MAXIMUM_CUSTOM_CREDITS) {
			throw new Error(
				`Maximum purchase limit is ${MAXIMUM_CUSTOM_CREDITS} credits.`,
			);
		}
	}

	const endpoint = payload.credits
		? '/billing/create-custom-order'
		: '/billing/create-order';

	const body = payload.credits
		? { credits: payload.credits }
		: { package_id: payload.package_id };

	const response = await api.post<PaymentOrderResponse>(endpoint, body);
	return response.data;
};

export const loadRazorpayScript = async (): Promise<boolean> => {
	if (typeof window === 'undefined') {
		return false;
	}

	if (window.Razorpay) {
		return true;
	}

	const existingScript = document.querySelector<HTMLScriptElement>(
		'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
	);

	if (existingScript) {
		return new Promise((resolve) => {
			existingScript.addEventListener('load', () =>
				resolve(Boolean(window.Razorpay)),
			);
			existingScript.addEventListener('error', () => resolve(false));
		});
	}

	return new Promise((resolve) => {
		const script = document.createElement('script');
		script.src = 'https://checkout.razorpay.com/v1/checkout.js';
		script.async = true;
		script.onload = () => resolve(Boolean(window.Razorpay));
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
};

export const openPaymentCheckout = async (
	order: PaymentOrderResponse,
	options?: {
		onSuccess?: (response: RazorpaySuccessResponse) => void;
		onDismiss?: () => void;
		onError?: (error: unknown) => void;
		userName?: string;
		userEmail?: string;
	},
) => {
	const razorpayKey = String(import.meta.env.VITE_RAZORPAY_KEY_ID ?? '').trim();
	if (!razorpayKey || razorpayKey === 'undefined' || razorpayKey === 'null') {
		throw new Error(
			'Missing VITE_RAZORPAY_KEY_ID in environment variables. Add the Razorpay key to continue.',
		);
	}

	const scriptReady = await loadRazorpayScript();
	if (!scriptReady || !window.Razorpay) {
		throw new Error(
			'Razorpay checkout script failed to load. Please check your network connection.',
		);
	}

	const razorpay = new window.Razorpay({
		key: razorpayKey,
		amount: Math.round(order.amount_inr * 100),
		currency: 'INR',
		name: 'RAG Matrix',
		description: `Purchase ${order.credits_purchased} credits`,
		order_id: order.gateway_order_id,
		prefill: {
			name: options?.userName ?? '',
			email: options?.userEmail ?? '',
		},
		notes: {
			order_id: String(order.id),
			credits: String(order.credits_purchased),
		},
		theme: {
			color: '#4f46e5',
		},
		handler: (response: RazorpaySuccessResponse) => {
			options?.onSuccess?.(response);
		},
		modal: {
			ondismiss: () => {
				options?.onDismiss?.();
			},
		},
	});

	try {
		razorpay.open();
	} catch (error) {
		options?.onError?.(error);
		throw error;
	}
};
