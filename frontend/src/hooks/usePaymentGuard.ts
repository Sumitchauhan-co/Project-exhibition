import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import type { PaymentGuardDetail } from '@/types/payment';

const PAYMENT_GUARD_KEY = 'payment_guard_reason';

const normalizePaymentDetail = (detail: unknown): Record<string, unknown> => {
	if (typeof detail === 'string') {
		return { message: detail };
	}

	if (detail && typeof detail === 'object') {
		return detail as Record<string, unknown>;
	}

	return {
		message: 'Your account does not have enough credits for this action.',
	};
};

export function usePaymentGuard() {
	const location = useLocation();

	const nextGuard = useMemo(() => {
		const stateGuard = (
			location.state as { creditGuard?: PaymentGuardDetail } | null
		)?.creditGuard;

		const storageGuard = (() => {
			if (typeof window === 'undefined') return null;
			const raw = sessionStorage.getItem(PAYMENT_GUARD_KEY);
			if (!raw) return null;
			try {
				return JSON.parse(raw) as PaymentGuardDetail;
			} catch {
				return null;
			}
		})();

		return stateGuard ?? storageGuard ?? null;
	}, [location.state]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		if (nextGuard) {
			sessionStorage.setItem(PAYMENT_GUARD_KEY, JSON.stringify(nextGuard));
			return;
		}

		sessionStorage.removeItem(PAYMENT_GUARD_KEY);
	}, [nextGuard]);

	return nextGuard;
}

export const persistPaymentGuard = (detail: unknown) => {
	if (typeof window === 'undefined') return;

	const payload = normalizePaymentDetail(detail);
	const redirectTarget =
		(typeof payload.redirect_to === 'string' && payload.redirect_to) ||
		'/payment';

	sessionStorage.setItem(
		PAYMENT_GUARD_KEY,
		JSON.stringify({
			...payload,
			redirect_to: redirectTarget,
		}),
	);
};

export { PAYMENT_GUARD_KEY };
