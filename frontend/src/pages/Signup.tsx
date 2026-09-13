import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpForm } from '../components/auth/SignupForm';

export const SignUpPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<SignUpForm
				onSuccess={() => navigate('/')}
				onNavigateToSignIn={() => navigate('/signin')}
			/>
		</div>
	);
};
