import { useState } from 'react';
import {
	Zap,
	RotateCcw,
	Clock,
	AlertCircle,
	ArrowLeft,
	CheckCircle2,
	ArrowRight,
	HelpCircle,
	Coins,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function CancellationAndRefund() {
	const navigate = useNavigate();
	const [hasAgreed, setHasAgreed] = useState(false);

	const handleAcceptAndContinue = () => {
		navigate('/');
	};

	return (
		<div className="min-h-screen w-full bg-zinc-50/50 dark:bg-zinc-950/50 py-10 sm:py-14">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
				{/* Back Link & Header */}
				<div className="space-y-4">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
					>
						<ArrowLeft className="h-3.5 w-3.5" /> Back to Overview
					</Link>

					<div>
						<div className="flex items-center gap-2.5 mb-2">
							<RotateCcw className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
							<h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
								Cancellation & Refund Policy
							</h1>
						</div>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							Last updated: September 11, 2026. Terms regarding credit pack
							purchases, instant digital fulfillment, and refund eligibility for
							RAG Matrix.
						</p>
					</div>
				</div>

				{/* Main Content Container */}
				<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					{/* Credit Model Overview */}
					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<Coins className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							1. Pay-As-You-Go Credit Model & No Recurring Subscriptions
						</div>
						<p>
							RAG Matrix operates on a pay-as-you-go credit system for
							benchmarking chunking strategies and RAG pipeline evaluation
							metrics.
						</p>
						<ul className="list-disc pl-5 mt-3 space-y-1.5 text-zinc-700 dark:text-zinc-300">
							<li>
								<strong>No Subscription Commitment:</strong> There are no
								monthly or annual recurring billing cycles. Users purchase
								digital credit top-up packs as needed.
							</li>
							<li>
								<strong>Instant Digital Delivery:</strong> Evaluation credits
								are added to your account balance immediately upon successful
								payment authorization through our payment gateway.
							</li>
							<li>
								<strong>No Involuntary Renewal:</strong> Because there are no
								recurring subscription fees, cancellation of auto-renewals is
								not required.
							</li>
						</ul>
					</section>

					{/* Cancellation & Orders */}
					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							2. Order Cancellation
						</div>
						<p>
							Due to the real-time, automated nature of digital credit delivery,
							credit purchase orders cannot be cancelled once payment processing
							completes and credits are loaded onto your account balance.
						</p>
					</section>

					{/* Refund Policy */}
					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<RotateCcw className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							3. Refund Eligibility
						</div>
						<p>
							As digital credits are made available instantly for chunking
							strategy benchmarks and evaluation queries, all credit sales are
							generally <strong>final and non-refundable</strong>.
						</p>
						<div className="mt-3 space-y-2">
							<p className="text-zinc-700 dark:text-zinc-300 font-medium">
								Exceptions & Special Conditions for Refund:
							</p>
							<ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
								<li>
									<strong>Duplicate Payment:</strong> If your account is
									double-billed due to a technical payment gateway issue, the
									extra charge will be refunded upon verification.
								</li>
								<li>
									<strong>Failed Credit Fulfillment:</strong> If payment
									succeeds but technical errors prevent credits from being
									deposited to your balance within 24 hours.
								</li>
							</ul>
						</div>
					</section>

					{/* Refund Processing Timeline */}
					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							4. Refund Processing Timeline
						</div>
						<p>
							In cases where an exception refund is approved by our billing
							support:
						</p>
						<div className="mt-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 p-4 border border-zinc-200/50 dark:border-zinc-800/50 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
							<p>
								<strong>Initiation:</strong> Approved refunds will be initiated
								within <strong>2 business days</strong>.
							</p>
							<p>
								<strong>Credit Timeframe:</strong> The refunded amount will
								reflect in your original payment method within{' '}
								<strong>5 to 7 working days</strong>, depending on bank and
								Razorpay processing schedules.
							</p>
						</div>
					</section>

					{/* Non-Refundable Items */}
					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<AlertCircle className="h-5 w-5 text-amber-500" />
							5. Non-Refundable Scenarios
						</div>
						<ul className="list-disc pl-5 space-y-1.5 text-zinc-600 dark:text-zinc-400">
							<li>
								Credits that have already been used to run chunking evaluations,
								synthetic queries, or RAG pipeline benchmarks.
							</li>
							<li>Unused credits remaining in an active account.</li>
							<li>
								Account suspensions or bans resulting from deliberate abuse or
								violations of our Terms of Service.
							</li>
						</ul>
					</section>

					{/* Contact Support */}
					<section>
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-base mb-2">
							<HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							6. Contacting Support
						</div>
						<p>
							If you experience payment deduction errors, duplicate
							transactions, or credit delivery delays, reach out to us at{' '}
							<a
								href="mailto:support@ragmatrix.dev"
								className="text-indigo-600 dark:text-indigo-400 underline font-medium"
							>
								support@ragmatrix.dev
							</a>{' '}
							with your payment reference ID and registered email address.
						</p>
					</section>
				</div>

				{/* Acceptance Footer Box */}
				<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
					<div className="space-y-2">
						<label className="flex items-center gap-3 cursor-pointer group">
							<input
								type="checkbox"
								checked={hasAgreed}
								onChange={(e) => setHasAgreed(e.target.checked)}
								className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
							/>
							<span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
								I have read and agree to the Cancellation & Refund Policy
							</span>
						</label>
						<p className="text-xs text-zinc-500 dark:text-zinc-400 pl-7">
							By checking this box, you acknowledge that credit pack purchases
							are non-refundable once credited.
						</p>
					</div>

					<button
						onClick={handleAcceptAndContinue}
						disabled={!hasAgreed}
						className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-sm shrink-0 ${
							hasAgreed
								? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-[0.98]'
								: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-zinc-700/50'
						}`}
					>
						{hasAgreed ? (
							<>
								<CheckCircle2 className="h-4 w-4" />
								Accept & Proceed
								<ArrowRight className="h-4 w-4" />
							</>
						) : (
							'Check box to Accept'
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
