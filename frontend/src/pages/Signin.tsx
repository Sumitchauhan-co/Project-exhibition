import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInForm } from '../components/auth/SigninForm';

export const SignInPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<SignInForm
				onSuccess={() => navigate('/')}
				onNavigateToSignUp={() => navigate('/signup')}
			/>
		</div>
	);
};
