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
	status: string;
	created_at: string;
}

export interface PaymentPayload {
	package_id?: string;
	credits?: number;
}

export type PaymentGuardDetail = {
	message?: string;
	required_credits?: number;
	available_credits?: number;
	redirect_to?: string;
	context?: string;
};
