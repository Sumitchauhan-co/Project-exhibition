import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/layout/ProtectedLayout';
import { InitialLoader } from '../components/InitialLoader';

import Home from '../pages/Home';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const SignInPage = lazy(() =>
	import('../pages/Signin').then((m) => ({ default: m.SignInPage })),
);
const SignUpPage = lazy(() =>
	import('../pages/Signup').then((m) => ({ default: m.SignUpPage })),
);
const PaymentPage = lazy(() => import('../pages/Payment'));

const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/TermsOfService'));
const CancellationAndRefund = lazy(
	() => import('../pages/CancellationAndRefund'),
);
const ContactUs = lazy(() => import('@/pages/ContactUs'));

export const AppRoutes: React.FC = () => {
	return (
		<Suspense fallback={<InitialLoader />}>
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
		</Suspense>
	);
};
