import { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';

import { Button } from '../ui/button';
import {
	createBillingOrder,
	openPaymentCheckout,
} from '../../services/payment';

interface PaymentButtonProps {
	packageId?: string;
	credits?: number;
	label: string;
	amount: number;
	className?: string;
	onSuccess?: () => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
	packageId,
	credits,
	label,
	amount,
	className,
	onSuccess,
}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handlePayment = async () => {
		setLoading(true);
		setError(null);

		try {
			const order = await createBillingOrder({
				package_id: packageId,
				credits,
			});

			await openPaymentCheckout(order, {
				onSuccess: () => {
					onSuccess?.();
				},
				onDismiss: () => setLoading(false),
				onError: () => setLoading(false),
			});
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Unable to start payment. Please try again.',
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full space-y-2">
			<Button
				onClick={handlePayment}
				disabled={loading}
				className={className ?? 'w-full'}
			>
				{loading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Processing...
					</>
				) : (
					<>
						<CreditCard className="mr-2 h-4 w-4" />
						{label}
					</>
				)}
			</Button>

			{amount > 0 && (
				<p className="text-xs text-zinc-500 dark:text-zinc-400">
					Total: ₹{amount}
				</p>
			)}

			{error && (
				<div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
					<CheckCircle2 className="h-3.5 w-3.5" />
					{error}
				</div>
			)}
		</div>
	);
};
