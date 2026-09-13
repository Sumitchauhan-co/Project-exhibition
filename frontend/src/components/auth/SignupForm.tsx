import React, { useState } from 'react';
import useAuthStore from '../../store/store';
import axios from 'axios';

interface SignUpFormProps {
	onSuccess?: () => void;
	onNavigateToSignIn?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
	onSuccess,
	onNavigateToSignIn,
}) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const signup = useAuthStore((state) => state.signup);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await signup(name, email, password);
			if (onSuccess) onSuccess();
		} catch (err) {
			let message = 'Failed to create account';

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
		<div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 transition-all">
			<div className="mb-6 text-center">
				<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
					Create Account
				</h2>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
					Get started with your free account today.
				</p>
			</div>

			{error && (
				<div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg">
					{error}
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-4"
			>
				<div>
					<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
						Full Name
					</label>
					<input
						type="text"
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="John Doe"
						className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
						Email
					</label>
					<input
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@example.com"
						className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
						Password
					</label>
					<input
						type="password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="••••••••"
						className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150 flex justify-center items-center"
				>
					{isLoading ? (
						<span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
					) : (
						'Sign Up'
					)}
				</button>
			</form>

			{onNavigateToSignIn && (
				<p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
					Already have an account?{' '}
					<button
						onClick={onNavigateToSignIn}
						className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline focus:outline-none"
					>
						Sign in
					</button>
				</p>
			)}
		</div>
	);
};
