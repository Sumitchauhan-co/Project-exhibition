import api from '../api/axios';
import type {
	PaymentOrderResponse,
	PaymentPackageOption,
} from '../types/payment';

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

export const createBillingOrder = async (payload: {
	package_id?: string;
	credits?: number;
}): Promise<PaymentOrderResponse> => {
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
		onSuccess?: () => void;
		onDismiss?: () => void;
		onError?: (error: unknown) => void;
		userName?: string;
		userEmail?: string;
	},
) => {
	const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
	if (!razorpayKey) {
		throw new Error(
			'Missing VITE_RAZORPAY_KEY_ID in your frontend environment variables.',
		);
	}

	const scriptReady = await loadRazorpayScript();
	if (!scriptReady || !window.Razorpay) {
		throw new Error('Razorpay checkout script failed to load.');
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
		handler: () => {
			options?.onSuccess?.();
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
