import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpForm } from '../components/auth/SignupForm';

export const SignUpPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-screen flex-col justify-center bg-zinc-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
			<SignUpForm
				onSuccess={() => navigate('/')}
				onNavigateToSignIn={() => navigate('/signin')}
			/>
		</div>
	);
};
