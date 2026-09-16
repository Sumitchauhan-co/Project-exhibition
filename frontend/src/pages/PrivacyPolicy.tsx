import { useState } from 'react';
import {
	Shield,
	Database,
	Eye,
	Lock,
	ArrowLeft,
	CheckCircle2,
	ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
							<Shield className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
							<h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
								Privacy Policy
							</h1>
						</div>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							Last updated: September 11, 2026. Learn how RAG Matrix Evaluation
							Suite collects, protects, and handles your personal information.
						</p>
					</div>
				</div>

				{/* Main Content Container */}
				<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							1. Information We Collect
						</div>
						<p>
							To provide accurate benchmark evaluations and RAG pipeline
							diagnostics, we collect specific dataset metrics and user data:
						</p>
						<ul className="list-disc pl-5 mt-3 space-y-1.5 text-zinc-700 dark:text-zinc-300">
							<li>
								<strong>Account & Payment Data:</strong> Email address, full
								name, billing details, and transaction histories processed
								securely via payment gateway partners (Razorpay).
							</li>
							<li>
								<strong>Evaluation Inputs:</strong> Vector chunks, synthetic
								query logs, and evaluation contexts submitted for benchmarking.
							</li>
							<li>
								<strong>System Logs:</strong> API response latencies, error
								logs, IP addresses, browser types, and metric scores (context
								recall, faithfulness, precision).
							</li>
						</ul>
					</section>

					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							2. How We Use Your Data
						</div>
						<p>
							We process data strictly to compute benchmarking metrics,
							facilitate seamless subscription payments, train platform
							evaluation models, and maintain operational stability.
						</p>
						<div className="mt-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 p-4 border border-zinc-200/50 dark:border-zinc-800/50 text-xs">
							<strong>Zero Fine-Tuning Guarantee:</strong> We do NOT use your
							private proprietary documents or evaluated context payloads to
							fine-tune public LLMs or share them with third parties.
						</div>
					</section>

					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
							<Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							3. Security & Storage
						</div>
						<p>
							All benchmark payloads and transactions in transit are encrypted
							using TLS 1.3. Rest data is stored using AES-256 encryption. Auth
							tokens remain isolated client-side and are authenticated via
							HTTP-only refresh flows or bearer tokens. We do not store credit
							card/debit card details directly on our servers.
						</p>
					</section>

					<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
						<h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base mb-2">
							4. Data Retention & Sharing
						</h3>
						<p>
							We retain personal data only for as long as necessary to fulfill
							the purposes outlined in this policy or comply with legal
							obligations. We do not sell or trade your personal data. We only
							share payment-related details with PCI-DSS compliant third-party
							payment processors like Razorpay to process payments safely.
						</p>
					</section>

					<section>
						<h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base mb-2">
							5. Your Data Rights & Contact Information
						</h3>
						<p>
							You retain complete ownership over your data. You may export or
							permanently delete your evaluation history and account metadata at
							any time through your dashboard settings. For privacy inquiries or
							requests, contact us at{' '}
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
								I have read and agree to the Privacy Policy
							</span>
						</label>
						<p className="text-xs text-zinc-500 dark:text-zinc-400 pl-7">
							By checking this box, you confirm acceptance of our data handling
							practices.
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
