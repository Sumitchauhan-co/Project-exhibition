import { useState } from 'react';
import {
	FileText,
	Scale,
	AlertTriangle,
	CreditCard,
	Ban,
	ArrowLeft,
	CheckCircle2,
	ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function TermsOfService() {
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
							<FileText className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
							<h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
								Terms of Service
							</h1>
						</div>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							Last updated: September 11, 2026. Terms governing the use of the
							RAG Matrix Evaluation platform and service offerings.
						</p>
					</div>
				</div>

				{/* Main Content Container */}
				<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							1. Acceptance of Terms
						</div>
						<p>
							By registering an account or using the RAG Matrix Evaluation
							Suite, you acknowledge that you have read, understood, and agree
							to be bound by these Terms of Service. If you are accessing this
							tool on behalf of an organization, you warrant that you have
							authority to bind that entity.
						</p>
					</section>

					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							2. Account Registration & Pricing
						</div>
						<p>
							You must provide accurate information when creating an account.
							Access to specific platform features or evaluation quotas requires
							an active subscription or credits purchased via our payment
							gateway. Prices and plan thresholds are detailed on our pricing
							page and are subject to change with advance notification.
						</p>
					</section>

					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<AlertTriangle className="h-5 w-5 text-amber-500" />
							3. Usage & API Rate Limits
						</div>
						<p>
							Users must adhere to reasonable usage thresholds based on their
							tier. Automated scraping, reverse engineering, or high-frequency
							request flooding designed to impair service infrastructure is
							strictly prohibited.
						</p>
						<p className="mt-2">
							We reserve the right to throttle or suspend accounts violating
							rate limits or threatening platform security for other developers.
						</p>
					</section>

					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<Ban className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							4. Intellectual Property & Service Level
						</div>
						<p>
							You retain all ownership of the datasets and data inputs submitted
							for benchmarking. RAG Matrix retains all rights to the platform
							proprietary evaluation algorithms, UI, software, and brand assets.
						</p>
						<p className="mt-2">
							Services are provided "AS IS" and "AS AVAILABLE". We are not
							liable for transient downstream LLM API failures, third-party
							model latencies, or vector database disruptions.
						</p>
					</section>

					<section>
						<h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base mb-2">
							5. Contact & Termination
						</h3>
						<p>
							We reserve the right to terminate or suspend access for accounts
							violating these terms. For questions regarding our terms, reach
							out to support at{' '}
							<a
								href="mailto:sumit.chauhan.code@gmail.com"
								className="text-indigo-600 dark:text-indigo-400 underline font-medium"
							>
								sumit.chauhan.code@gmail.com
							</a>
							.
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
								I have read and agree to the Terms of Service
							</span>
						</label>
						<p className="text-xs text-zinc-500 dark:text-zinc-400 pl-7">
							By checking this box, you confirm agreement with platform
							guidelines and service terms.
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
