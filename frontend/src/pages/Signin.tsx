import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInForm } from '../components/auth/SigninForm';

export const SignInPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-screen flex-col justify-center bg-zinc-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
			<SignInForm
				onSuccess={() => navigate('/')}
				onNavigateToSignUp={() => navigate('/signup')}
			/>
		</div>
	);
};
