import React from 'react';
import { Link } from 'react-router-dom';
import {
	Shield,
	ArrowUpRight,
	Galaxy,
	GitFork,
	Cookie,
	FileText,
	RotateCcw,
	Mail,
	Briefcase,
	Camera,
	Send,
} from 'lucide-react';

interface FooterProps {
	onOpenCookieSettings?: () => void;
}

interface NavLinkItem {
	label: string;
	href?: string;
	to?: string;
	icon?: React.ComponentType<{ className?: string }>;
	isExternal?: boolean;
	isAction?: boolean;
	actionType?: 'cookie';
}

interface NavSection {
	title: string;
	links: NavLinkItem[];
}

export const Footer: React.FC<FooterProps> = ({ onOpenCookieSettings }) => {
	const currentYear = new Date().getFullYear();
	const apiUrl = import.meta.env.VITE_API_URL || '';

	const handleResetCookies = (e: React.MouseEvent) => {
		if (onOpenCookieSettings) {
			e.preventDefault();
			onOpenCookieSettings();
		} else {
			localStorage.removeItem('cookie_consent_status');
			window.location.reload();
		}
	};

	// Navigation Sections Data Array
	const FOOTER_NAV_SECTIONS: NavSection[] = [
		{
			title: 'Product',
			links: [
				{ label: 'Overview', to: '/' },
				{ label: 'Dashboard', to: '/dashboard' },
				{ label: 'Pricing & Plans', to: '/payment' },
				...(apiUrl
					? [
							{
								label: 'API Docs',
								href: `${apiUrl}/docs`,
								icon: ArrowUpRight,
								isExternal: true,
							},
						]
					: []),
			],
		},
		{
			title: 'Legal & Policy',
			links: [
				{ label: 'Privacy Policy', to: '/privacy-policy', icon: Shield },
				{ label: 'Terms of Service', to: '/terms-of-service', icon: FileText },
				{
					label: 'Cancellation & Refund',
					to: '/cancellation-and-refund',
					icon: RotateCcw,
				},
				{ label: 'Contact Us', to: '/contact-us', icon: Mail },
				{
					label: 'Cookie Settings',
					isAction: true,
					actionType: 'cookie',
					icon: Cookie,
				},
			],
		},
		{
			title: 'Connect',
			links: [
				{
					label: 'GitHub Repository',
					href: 'https://github.com/Sumitchauhan-co/Project-exhibition',
					icon: GitFork,
					isExternal: true,
				},
				{
					label: 'LinkedIn',
					href: 'https://linkedin.com',
					icon: Briefcase,
					isExternal: true,
				},
				{
					label: 'X',
					href: 'https://x.com',
					icon: Send,
					isExternal: true,
				},
				{
					label: 'Instagram',
					href: 'https://instagram.com',
					icon: Camera,
					isExternal: true,
				},
			],
		},
	];

	return (
		<footer
			className="w-full border-t border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors"
			aria-label="Site Footer"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
					{/* Brand & Operational Status */}
					<div className="md:col-span-2 space-y-4">
						<Link
							to="/"
							className="inline-flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-90 transition-opacity"
						>
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
								<Galaxy className="h-5 w-5" />
							</div>
							<span className="tracking-tight">RAG Matrix</span>
						</Link>

						<p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
							Automated evaluation matrix for Retrieval-Augmented Generation
							systems. Benchmarking latency, context recall, and faithfulness
							across LLMs.
						</p>

						<div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
							</span>
							All Pipeline Engines Operational
						</div>
					</div>

					{/* Dynamically Rendered Footer Sections */}
					{FOOTER_NAV_SECTIONS.map((section) => (
						<div
							key={section.title}
							className="space-y-3"
						>
							<h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
								{section.title}
							</h3>
							<ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
								{section.links.map((link) => {
									const Icon = link.icon;

									if (link.isAction && link.actionType === 'cookie') {
										return (
											<li key={link.label}>
												<button
													type="button"
													onClick={handleResetCookies}
													className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer pt-1"
												>
													{Icon && <Icon className="h-3.5 w-3.5" />}
													{link.label}
												</button>
											</li>
										);
									}

									if (link.isExternal && link.href) {
										return (
											<li key={link.label}>
												<a
													href={link.href}
													target="_blank"
													rel="noopener noreferrer"
													className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
												>
													{Icon && <Icon className="h-4 w-4" />}
													{link.label}
												</a>
											</li>
										);
									}

									return (
										<li key={link.label}>
											<Link
												to={link.to || '/'}
												className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
											>
												{Icon && <Icon className="h-4 w-4" />}
												{link.label}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</div>

				{/* Bottom Copyright Bar */}
				<div className="mt-12 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
					<p>
						© {currentYear} RAG Matrix Evaluation Suite. All rights reserved.
					</p>
					<p className="flex items-center gap-1">
						Built for high-performance RAG observability.
					</p>
				</div>
			</div>
		</footer>
	);
};
