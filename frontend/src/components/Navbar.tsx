import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Galaxy } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import useAuthStore from '../store/store';
import { SignOutButton } from './auth/SignoutButton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { formatMemberSinceDate } from './utils/date';
import api from '../api/axios';

export const Navbar: React.FC = () => {
	const navigate = useNavigate();
	const { isAuthenticated, user } = useAuthStore();
	const [creditBalance, setCreditBalance] = useState<number | null>(null);

	useEffect(() => {
		if (!isAuthenticated) {
			setCreditBalance(null);
			return;
		}

		let isActive = true;

		const fetchBalance = async () => {
			try {
				const response = await api.get<{ balance: number }>('/billing/balance');
				if (isActive) {
					setCreditBalance(response.data.balance);
				}
			} catch (error) {
				console.error('Failed to load credit balance', error);
				if (isActive) {
					setCreditBalance(null);
				}
			}
		};

		void fetchBalance();
		const intervalId = window.setInterval(() => {
			void fetchBalance();
		}, 15000);

		return () => {
			isActive = false;
			window.clearInterval(intervalId);
		};
	}, [isAuthenticated]);

	const handleHomeClick = useCallback(() => navigate('/'), [navigate]);
	const handleSignInClick = useCallback(() => navigate('/signin'), [navigate]);
	const handleDashboardClick = useCallback(
		() => navigate('/dashboard'),
		[navigate],
	);
	const handlePaymentClick = useCallback(
		() => navigate('/payment'),
		[navigate],
	);

	const userInitial = (user?.full_name || user?.email || 'U')
		.charAt(0)
		.toUpperCase();

	const createdAtFormatted = formatMemberSinceDate(user?.created_at);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-950/75 backdrop-blur-md transition-colors">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				{/* Brand / Logo */}
				<button
					onClick={handleHomeClick}
					className="group flex items-center gap-2.5 text-lg font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg py-1 px-1.5 -ml-1.5 transition-colors cursor-pointer"
					aria-label="RAG Benchmark Home"
				>
					<Galaxy className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:rotate-180 transition-transform duration-300 ease-out" />
					<span className="tracking-tight">RAG Matrix</span>
				</button>

				{/* Right Section */}
				<div className="flex items-center gap-1.5 sm:gap-3">
					{isAuthenticated && (
						<button
							onClick={handlePaymentClick}
							className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
								(creditBalance ?? 0) <= 50
									? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
									: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300'
							}`}
						>
							<Coins className="h-3.5 w-3.5" />
							{creditBalance ?? 0} credits
						</button>
					)}

					{/* Home Button */}
					<button
						onClick={handleHomeClick}
						className="relative px-3.5 py-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg transition-colors cursor-pointer after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-indigo-600 dark:after:bg-indigo-400 after:w-0 hover:after:w-[calc(100%-1.75rem)] after:transition-all after:duration-200 after:ease-out"
					>
						Home
					</button>

					{/* Dashboard Button */}
					<button
						onClick={handleDashboardClick}
						className="relative px-3.5 py-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg transition-colors cursor-pointer after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-indigo-600 dark:after:bg-indigo-400 after:w-0 hover:after:w-[calc(100%-1.75rem)] after:transition-all after:duration-200 after:ease-out"
					>
						Dashboard
					</button>

					<button
						onClick={handlePaymentClick}
						className="relative px-3.5 py-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg transition-colors cursor-pointer after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-indigo-600 dark:after:bg-indigo-400 after:w-0 hover:after:w-[calc(100%-1.75rem)] after:transition-all after:duration-200 after:ease-out"
					>
						Payment
					</button>

					{/* Conditional Rendering: Authenticated Profile vs Sign In */}
					{isAuthenticated ? (
						<Popover>
							<PopoverTrigger
								className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
								aria-label="User menu"
							>
								<Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800 bg-indigo-50 dark:bg-indigo-950/50 hover:border-indigo-500/50 transition-colors">
									<AvatarFallback className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
										{userInitial}
									</AvatarFallback>
								</Avatar>
							</PopoverTrigger>

							<PopoverContent
								align="end"
								className="w-64 p-2.5 border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl rounded-xl space-y-1"
							>
								{/* User Info Header */}
								<div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
									<Avatar className="h-9 w-9 bg-indigo-100 dark:bg-indigo-900/40 shrink-0">
										<AvatarFallback className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
											{userInitial}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col min-w-0">
										<p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
											{user?.full_name || 'User Profile'}
										</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
											{user?.email}
										</p>
									</div>
								</div>

								{/* Sign Out Section */}
								<div className="w-full">
									<SignOutButton />
								</div>

								{/* Member Since (Created At) Footer */}
								{createdAtFormatted && (
									<div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
										Member since {createdAtFormatted}
									</div>
								)}
							</PopoverContent>
						</Popover>
					) : (
						<button
							onClick={handleSignInClick}
							className="relative px-3.5 py-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg transition-colors cursor-pointer after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-indigo-600 dark:after:bg-indigo-400 after:w-0 hover:after:w-[calc(100%-1.75rem)] after:transition-all after:duration-200 after:ease-out"
						>
							Sign In
						</button>
					)}

					{/* Theme Toggle */}
					<div className="w-9 h-9 flex items-center justify-center shrink-0 ml-1">
						<ModeToggle />
					</div>
				</div>
			</div>
		</header>
	);
};
