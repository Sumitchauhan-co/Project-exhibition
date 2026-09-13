import { useMemo, useState } from 'react';
import {
	AlertTriangle,
	Coins,
	CreditCard,
	IndianRupee,
	Loader2,
	RotateCw,
	Sparkles,
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { PaymentButton } from '../components/payments/PaymentButton';
import { PAYMENT_PACKAGES } from '../services/payment';
import { useCreditBalance } from '@/hooks/useCreditBalance';
import { usePaymentGuard } from '@/hooks/usePaymentGuard';

export default function PaymentPage() {
	const [customCredits, setCustomCredits] = useState('500');
	const [customPaymentSuccess, setCustomPaymentSuccess] = useState(false);
	const creditGuard = usePaymentGuard();
	const { data: balance = 0, isLoading: isLoadingBalance, refetch: fetchBalance } =
		useCreditBalance();

	const customCreditsValue = Number(customCredits) || 0;
	const customAmount = useMemo(() => {
		if (!customCreditsValue) return 0;
		return Math.max(0, Number((customCreditsValue * 0.1).toFixed(2)));
	}, [customCreditsValue]);

	const isCustomAmountValid = customCreditsValue >= 100;
	const creditGateMessage =
		creditGuard?.message ||
		'You have run out of credits. Add funds to continue with benchmark evaluation.';

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
			<div className="mb-8 space-y-2">
				<p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 sm:text-sm">
					Billing
				</p>
				<h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
					Buy Credits
				</h1>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					Recharge your account for benchmark runs and advanced evaluation jobs.
				</p>
			</div>

			{creditGuard && (
				<div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/80 dark:bg-amber-950/30 dark:text-amber-200">
					<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
					<div className="space-y-1">
						<p className="font-semibold">Action blocked by credit policy</p>
						<p>{creditGateMessage}</p>
						{typeof creditGuard.required_credits === 'number' && (
							<p className="text-xs opacity-80">
								This run requires {creditGuard.required_credits} credits and you
								currently have{' '}
								{isLoadingBalance
									? 'checking...'
									: (creditGuard.available_credits ?? balance ?? 0)}{' '}
								available.
							</p>
						)}
					</div>
				</div>
			)}

			{/* Available Balance Card */}
			<div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<div className="flex items-center justify-between gap-3">
					<div>
						<div className="flex items-center gap-2">
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								Available balance
							</p>
							<button
								type="button"
								onClick={() => {
									void fetchBalance();
								}}
								disabled={isLoadingBalance}
								title="Refresh credit balance"
								className="inline-flex items-center justify-center rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
							>
								<RotateCw
									className={`h-3.5 w-3.5 ${isLoadingBalance ? 'animate-spin' : ''}`}
								/>
							</button>
						</div>
						{isLoadingBalance ? (
							<div className="mt-1 flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
								<span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
									Fetching your credit balance...
								</span>
							</div>
						) : (
							<p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
								{balance ?? 0} credits
							</p>
						)}
					</div>
					<div className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
						Secure checkout
					</div>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{PAYMENT_PACKAGES.map((pkg) => (
					<div
						key={pkg.id}
						className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
					>
						<div className="mb-4 flex items-center justify-between">
							<div>
								<p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
									{pkg.label}
								</p>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									{pkg.description}
								</p>
							</div>
							<div className="inline-flex items-center justify-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/60 shadow-xs">
								<Coins className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
								<span>{pkg.credits} Credits</span>
							</div>
						</div>

						<div className="mb-5 flex items-end gap-2">
							<IndianRupee className="h-5 w-5 text-zinc-500" />
							<span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
								₹{pkg.amount}
							</span>
						</div>

						<PaymentButton
							packageId={pkg.id}
							amount={pkg.amount}
							label="Pay Now"
							className="w-full"
							onSuccess={() => {
								console.info(`Purchased ${pkg.label}`);
								void fetchBalance();
							}}
						/>
					</div>
				))}
			</div>

			<div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:p-6">
				<div className="mb-4 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
						<CreditCard className="h-5 w-5" />
					</div>
					<div>
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
							Custom Credits
						</h2>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							Choose the exact number of credits you need.
						</p>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr] md:items-end">
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
							Credits
						</label>
						<input
							type="number"
							min={100}
							step={100}
							value={customCredits}
							onChange={(event) => setCustomCredits(event.target.value)}
							className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none ring-0 transition focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
							placeholder="Enter credits"
						/>
					</div>

					<div className="space-y-2">
						<div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-medium text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
							Estimated total: ₹{customAmount || 0}
						</div>
					</div>
				</div>

				<div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="text-sm text-zinc-500 dark:text-zinc-400">
						{!isCustomAmountValid && customCreditsValue > 0
							? 'Minimum custom purchase is 100 credits.'
							: customPaymentSuccess
								? 'Payment completed successfully.'
								: `You are buying ${customCreditsValue || 0} credits.`}
					</div>

					{isCustomAmountValid ? (
						<PaymentButton
							credits={customCreditsValue}
							amount={customAmount}
							label={`Pay ₹${customAmount}`}
							className="min-w-[180px]"
							onSuccess={() => {
								setCustomPaymentSuccess(true);
								void fetchBalance();
							}}
						/>
					) : (
						<Button
							type="button"
							disabled
							className="min-w-[180px]"
						>
							Enter valid credits
						</Button>
					)}
				</div>
			</div>

			<div className="mt-10 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-sm text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
				<div className="flex items-center gap-2 font-medium">
					<Sparkles className="h-4 w-4" />
					Why buy credits?
				</div>
				<p className="mt-2 leading-relaxed">
					Credits power your benchmark and evaluation runs. They help you test
					more model combinations and analyze more document sets without waiting
					for manual approvals.
				</p>
			</div>
		</div>
	);
}
