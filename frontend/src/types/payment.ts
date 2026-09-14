export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type TransactionType = 'PURCHASE' | 'USAGE' | 'REFUND' | 'ONBOARDING';

export interface PaymentPackageOption {
	id: string;
	label: string;
	amount: number;
	credits: number;
	description: string;
}

export interface PaymentOrderResponse {
	id: number;
	gateway_order_id: string;
	amount_inr: number;
	credits_purchased: number;
	status: PaymentStatus;
	created_at: string;
}

export interface CreditBalanceResponse {
	balance: number;
	lifetime_earned: number;
	lifetime_spent: number;
}

export interface CreditTransaction {
	id: number;
	user_id: string;
	payment_order_id?: number | null;
	amount: number;
	type: TransactionType;
	description: string;
	created_at: string;
}

export interface PaymentPayload {
	package_id?: string;
	credits?: number;
}

export interface VerifyPaymentPayload {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
}

export interface RazorpaySuccessResponse {
	razorpay_payment_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
}

export interface PaymentGuardDetail {
	message?: string;
	required_credits?: number;
	available_credits?: number;
	redirect_to?: string;
	context?: string;
}
