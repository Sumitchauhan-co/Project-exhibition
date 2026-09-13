import React, { useState } from 'react';
import useAuthStore from '../../store/store';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

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
		<div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 transition-all">
			<div className="mb-6 text-center">
				<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
					Sign In
				</h2>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
					Welcome back! Please enter your details.
				</p>
			</div>

			{error && (
				<div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg">
					{error}
				</div>
			)}

			<div className="mb-4 flex justify-center w-full">
				<GoogleLogin
					onSuccess={handleGoogleSuccess}
					onError={() => setError('Google Authentication Failed')}
					useOneTap
					width="100%"
				/>
			</div>

			<div className="relative my-6">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
						Or continue with
					</span>
				</div>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-4"
			>
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
						'Sign In'
					)}
				</button>
			</form>

			{onNavigateToSignUp && (
				<p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
					Don't have an account?{' '}
					<button
						onClick={onNavigateToSignUp}
						className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline focus:outline-none"
					>
						Sign up
					</button>
				</p>
			)}
		</div>
	);
};
