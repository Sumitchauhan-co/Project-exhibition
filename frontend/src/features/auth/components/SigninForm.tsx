import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import useAuthStore from '@/store/store';

interface SignInFormProps {
	onSuccess?: () => void;
	onNavigateToSignUp?: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
	onSuccess,
	onNavigateToSignUp,
}) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const signin = useAuthStore((state) => state.signin);
	const googleSignin = useAuthStore((state) => state.googleSignin);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await signin(email, password);
			if (onSuccess) onSuccess();
		} catch (err) {
			let message = 'Invalid email or password';

			if (axios.isAxiosError(err)) {
				message = err.response?.data?.detail || err.message || message;
			} else if (err instanceof Error) {
				message = err.message;
			}

			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSuccess = async (credentialResponse: any) => {
		if (!credentialResponse.credential) {
			setError('Google sign-in failed: No token returned');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			await googleSignin(credentialResponse.credential);
			if (onSuccess) onSuccess();
		} catch (err) {
			let message = 'Google sign-in failed';

			if (axios.isAxiosError(err)) {
				message = err.response?.data?.detail || err.message || message;
			} else if (err instanceof Error) {
				message = err.message;
			}

			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur-xl transition-all dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-8">
			{/* Subtle Ambient Background Glow */}
			<div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

			{/* Header */}
			<div className="relative mb-6 text-center">
				<h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
					Welcome back
				</h2>
				<p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
					Sign in to your account to continue benchmarking
				</p>
			</div>

			{/* Error Banner */}
			{error && (
				<div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
					<AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
					<span>{error}</span>
				</div>
			)}

			{/* Google Sign In Wrapper */}
			<div className="mb-5 flex justify-center w-full">
				<GoogleLogin
					onSuccess={handleGoogleSuccess}
					onError={() => setError('Google Authentication Failed')}
					useOneTap
					width="100%"
					theme="outline"
					shape="pill"
				/>
			</div>

			{/* Divider */}
			<div className="relative my-6">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
				</div>
				<div className="relative flex justify-center text-xs tracking-wider uppercase">
					<span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 dark:text-zinc-500 font-semibold">
						or sign in with email
					</span>
				</div>
			</div>

			{/* Credentials Form */}
			<form
				onSubmit={handleSubmit}
				className="space-y-4"
			>
				<div>
					<label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
						Email Address
					</label>
					<div className="relative">
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
							<Mail className="h-4 w-4" />
						</div>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							className="w-full rounded-xl border border-zinc-300/80 bg-zinc-50/50 pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/50 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-400 dark:focus:bg-zinc-800 dark:focus:ring-indigo-400/10"
						/>
					</div>
				</div>

				<div>
					<label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
						Password
					</label>
					<div className="relative">
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
							<Lock className="h-4 w-4" />
						</div>
						<input
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							className="w-full rounded-xl border border-zinc-300/80 bg-zinc-50/50 pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/50 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-400 dark:focus:bg-zinc-800 dark:focus:ring-indigo-400/10"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="group relative w-full overflow-hidden rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.99] disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer"
				>
					{isLoading ? (
						<div className="flex items-center justify-center gap-2">
							<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							<span>Authenticating...</span>
						</div>
					) : (
						<div className="flex items-center justify-center gap-2">
							<span>Sign In</span>
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
						</div>
					)}
				</button>
			</form>

			{/* Navigation link */}
			{onNavigateToSignUp && (
				<p className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
					Don't have an account?{' '}
					<button
						onClick={onNavigateToSignUp}
						className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline focus:outline-none cursor-pointer"
					>
						Sign up for free
					</button>
				</p>
			)}

			{/* Terms & Legal Notice Disclaimer */}
			<div className="mt-6 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 text-center">
				<p className="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
					By continuing, you agree to our{' '}
					<Link
						to="/terms-of-service"
						className="text-zinc-600 dark:text-zinc-400 underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
					>
						Terms of Service
					</Link>
					,{' '}
					<Link
						to="/privacy-terms"
						className="text-zinc-600 dark:text-zinc-400 underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
					>
						Privacy Policy
					</Link>
					, and{' '}
					<Link
						to="/cancellation-and-refund"
						className="text-zinc-600 dark:text-zinc-400 underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
					>
						Cancellation & Refund Policy
					</Link>
					.
				</p>
			</div>
		</div>
	);
};
