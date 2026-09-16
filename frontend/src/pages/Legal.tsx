import { useState } from 'react';
import {
	Shield,
	FileText,
	Lock,
	Database,
	Eye,
	Scale,
	AlertTriangle,
	ArrowLeft,
	CheckCircle2,
	ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Legal() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');
	const [hasAgreed, setHasAgreed] = useState(false);

	const handleAcceptAndContinue = () => {
		// Navigate to Overview (Home page)
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
						<h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
							Legal Center
						</h1>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							Last updated: September 11, 2026. Review our Privacy Policy and
							Terms of Service for the RAG Matrix Evaluation Suite.
						</p>
					</div>
				</div>

				{/* Tab Switcher Bar */}
				<div className="sticky z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl p-1.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
					<button
						onClick={() => setActiveTab('privacy')}
						className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
							activeTab === 'privacy'
								? 'bg-indigo-600 text-white shadow-sm'
								: 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
						}`}
					>
						<Shield className="h-4 w-4" />
						Privacy Policy
					</button>
					<button
						onClick={() => setActiveTab('terms')}
						className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
							activeTab === 'terms'
								? 'bg-indigo-600 text-white shadow-sm'
								: 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
						}`}
					>
						<FileText className="h-4 w-4" />
						Terms of Service
					</button>
				</div>

				{/* Main Document Container */}
				<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					{activeTab === 'privacy' ? (
						/* PRIVACY POLICY CONTENT */
						<div className="space-y-8 animate-in fade-in duration-200">
							<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
								<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
									<Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
									1. Information We Collect
								</div>
								<p>
									To provide accurate benchmark evaluations and RAG pipeline
									diagnostics, we collect specific dataset metrics and user
									data:
								</p>
								<ul className="list-disc pl-5 mt-3 space-y-1.5 text-zinc-700 dark:text-zinc-300">
									<li>
										<strong>Account Data:</strong> Email address, encrypted
										credentials, and profile identifiers upon sign up.
									</li>
									<li>
										<strong>Evaluation Inputs:</strong> Vector chunks, synthetic
										query logs, and evaluation contexts submitted for
										benchmarking.
									</li>
									<li>
										<strong>System Logs:</strong> API response latencies, error
										logs, and metric scores (context recall, faithfulness,
										precision).
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
									train evaluation models, and maintain operational stability.
								</p>
								<div className="mt-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 p-4 border border-zinc-200/50 dark:border-zinc-800/50 text-xs">
									<strong>Zero Fine-Tuning Guarantee:</strong> We do NOT use
									your private proprietary documents or evaluated context
									payloads to fine-tune public LLMs or share them with third
									parties.
								</div>
							</section>

							<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
								<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
									<Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
									3. Security & Storage
								</div>
								<p>
									All benchmark payloads in transit are encrypted using TLS 1.3.
									Rest data is stored using AES-256 encryption. Auth tokens
									remain isolated client-side and are authenticated via
									HTTP-only refresh flows or bearer tokens.
								</p>
							</section>

							<section>
								<h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base mb-2">
									4. Your Data Rights
								</h3>
								<p>
									You retain complete ownership over your benchmark results. You
									may export or permanently delete your evaluation history and
									account metadata at any time through your dashboard settings.
								</p>
							</section>
						</div>
					) : (
						/* TERMS OF SERVICE CONTENT */
						<div className="space-y-8 animate-in fade-in duration-200">
							<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
								<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
									<Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
									1. Terms of Acceptance
								</div>
								<p>
									By creating an account or accessing the RAG Matrix Evaluation
									platform, you agree to comply with these terms. If you are
									accessing this tool on behalf of an enterprise, you warrant
									that you have authority to bind that entity.
								</p>
							</section>

							<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
								<div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">
									<AlertTriangle className="h-5 w-5 text-amber-500" />
									2. Usage & API Rate Limits
								</div>
								<p>
									Users must adhere to reasonable usage thresholds. Automated
									scraping, malicious high-frequency request flooding, or
									attempting to reverse-engineer underlying benchmarking models
									is strictly prohibited.
								</p>
								<p className="mt-2">
									We reserve the right to throttle or temporarily suspend access
									if anomalous traffic threatens platform availability for other
									developers.
								</p>
							</section>

							<section className="border-b border-zinc-100 dark:border-zinc-800/60 pb-6">
								<h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base mb-2">
									3. Service Level & Availability
								</h3>
								<p>
									While we strive for 99.9% uptime across evaluation matrix
									engines, services are provided "AS IS" and "AS AVAILABLE". We
									are not liable for transient downstream LLM API timeouts or
									vector store connectivity issues.
								</p>
							</section>

							<section>
								<h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base mb-2">
									4. Contact & Disputes
								</h3>
								<p>
									For inquiries regarding legal terms or privacy requests,
									contact us at{' '}
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
					)}
				</div>

				{/* Acceptance Section Box */}
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
								I have read and agree to the Privacy Policy and Terms of Service
							</span>
						</label>
						<p className="text-xs text-zinc-500 dark:text-zinc-400 pl-7">
							By checking this box, you confirm acceptance of our data
							processing standards and platform terms.
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
								Accept & Proceed to Overview
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
