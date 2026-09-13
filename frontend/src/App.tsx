import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { ThemeProvider } from './components/theme-provider';
import { AppRoutes } from './routes/AppRoute';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { Toaster } from './components/ui/toast';
import { useAuthSession } from './hooks/useAuthSession';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

export default function App() {
	const { isPending, isSuccess } = useAuthSession();

	useEffect(() => {
		if (isSuccess) {
			window.dispatchEvent(new Event('auth:ready'));
		}
	}, [isSuccess]);

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-slate-950">
				<LoadingSpinner label="Checking your session..." />
			</div>
		);
	}

	return (
		<ThemeProvider
			defaultTheme="dark"
			storageKey="rag-dashboard-theme"
		>
			<BrowserRouter>
				<AnalyticsTracker />
				<Toaster />
				<AppRoutes />
				<CookieConsentBanner />
			</BrowserRouter>
		</ThemeProvider>
	);
}
