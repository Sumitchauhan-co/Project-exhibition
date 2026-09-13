import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../LoadingSpinner';
import useAuthStore from '../../store/store';

export const ProtectedRoute: React.FC = () => {
	const { isAuthenticated, isLoaded } = useAuthStore();
	const location = useLocation();

	if (!isLoaded) {
		return (
			<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
				<LoadingSpinner label="Verifying session..." />
			</div>
		);
	}

	// Redirect to signin, preserving intended destination state
	if (!isAuthenticated) {
		return (
			<Navigate
				to="/signin"
				state={{ from: location }}
				replace
			/>
		);
	}

	return <Outlet />;
};
