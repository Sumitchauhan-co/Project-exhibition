import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useAuthStore from '../../store/store';

export const SignOutButton: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const signout = useAuthStore((state) => state.signout);
	const navigate = useNavigate();

	const handleSignOut = async () => {
		setIsLoading(true);
		try {
			await signout();
			navigate('/signin');
		} catch (error) {
			console.error('Failed to sign out:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleSignOut}
			disabled={isLoading}
			className="w-full flex items-center justify-start gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
			aria-label="Sign out"
		>
			<LogOut className="w-4 h-4" />
			<span>{isLoading ? 'Signing out...' : 'Sign Out'}</span>
		</button>
	);
};
