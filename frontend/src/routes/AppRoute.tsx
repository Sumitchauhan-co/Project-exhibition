import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import { SignInPage } from '../pages/Signin';
import { SignUpPage } from '../pages/Signup';
import { ProtectedRoute } from '../components/layout/ProtectedLayout';
import PaymentPage from '../pages/Payment';

// Import newly separated policy pages
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import CancellationAndRefund from '../pages/CancellationAndRefund';
import ContactUs from '@/pages/ContactUs';

export const AppRoutes: React.FC = () => {
	return (
		<Routes>
			<Route element={<AppLayout />}>
				{/* Public Routes */}
				<Route
					path="/"
					element={<Home />}
				/>
				<Route
					path="/signin"
					element={<SignInPage />}
				/>
				<Route
					path="/signup"
					element={<SignUpPage />}
				/>

				{/* Protected Routes (Requires Auth) */}
				<Route element={<ProtectedRoute />}>
					<Route
						path="/dashboard"
						element={<Dashboard />}
					/>
					<Route
						path="/payment"
						element={<PaymentPage />}
					/>
				</Route>
			</Route>

			{/* Dedicated Razorpay Compliance Legal Routes */}
			<Route
				path="/privacy-policy"
				element={<PrivacyPolicy />}
			/>
			<Route
				path="/terms-of-service"
				element={<TermsOfService />}
			/>
			<Route
				path="/cancellation-and-refund"
				element={<CancellationAndRefund />}
			/>
			<Route
				path="/contact-us"
				element={<ContactUs />}
			/>

			{/* Redirect old combined route to Privacy Policy */}
			<Route
				path="/privacy-terms"
				element={
					<Navigate
						to="/privacy-policy"
						replace
					/>
				}
			/>

			{/* Fallback wildcard */}
			<Route
				path="*"
				element={
					<Navigate
						to="/"
						replace
					/>
				}
			/>
		</Routes>
	);
};
