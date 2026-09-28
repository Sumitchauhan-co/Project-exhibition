import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

// Global declaration to ensure TypeScript doesn't throw TS2339 / TS18048 errors
declare global {
	interface Window {
		dataLayer?: any[];
		gtag?: (...args: any[]) => void;
	}
}

export const CookieConsentBanner: React.FC = () => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const consent = localStorage.getItem('cookie_consent_status');
		if (!consent) {
			setIsVisible(true);
		} else if (consent === 'accepted') {
			enableAnalytics();
		}
	}, []);

	const enableAnalytics = () => {
		if (
			typeof window !== 'undefined' &&
			import.meta.env.VITE_GA_MEASUREMENT_ID
		) {
			const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

			if (!document.getElementById('ga-script')) {
				window.dataLayer = window.dataLayer || [];

				function gtag(...args: any[]) {
					(window.dataLayer = window.dataLayer ?? []).push(args);
				}
				window.gtag = gtag;

				gtag('js', new Date());

				// Pass explicit debug_mode flag
				gtag('config', gaId, {
					debug_mode: true,
				});

				// Force a manual event to push immediately into DebugView
				gtag('event', 'cookie_consent_accepted', {
					debug_mode: true,
				});

				const script = document.createElement('script');
				script.id = 'ga-script';
				script.async = true;
				script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}&dbg=1`;
				document.head.appendChild(script);
			}
		}
	};

	const handleAccept = () => {
		localStorage.setItem('cookie_consent_status', 'accepted');
		setIsVisible(false);
		enableAnalytics();
		if (typeof window.gtag === 'function') {
			window.gtag('consent', 'update', {
				analytics_storage: 'granted',
			});
		}

		window.dispatchEvent(new Event('consent_updated'));
	};

	const handleReject = () => {
		localStorage.setItem('cookie_consent_status', 'rejected');
		setIsVisible(false);

		window.dispatchEvent(new Event('consent_updated'));
	};

	if (!isVisible) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-zinc-950/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
			<div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
							<Cookie className="h-5 w-5" />
						</div>
						<div>
							<h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
								We value your privacy
							</h3>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								Essential cookies run our matrix benchmark tools. Optional
								cookies help us optimize system latency metrics.
							</p>
						</div>
					</div>
				</div>

				<p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
					By clicking <strong>"Accept All"</strong>, you consent to our storage
					of cookies on your device to enhance navigation and site analytics.
					You can review our full terms in our{' '}
					<Link
						to="/privacy-terms"
						className="text-indigo-600 dark:text-indigo-400 underline font-medium"
					>
						Privacy Policy & Terms
					</Link>
					.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
					<button
						onClick={handleReject}
						type="button"
						className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
					>
						Essential Only
					</button>

					<button
						onClick={handleAccept}
						type="button"
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
					>
						<ShieldCheck className="h-4 w-4" />
						Accept All Cookies
					</button>
				</div>
			</div>
		</div>
	);
};
