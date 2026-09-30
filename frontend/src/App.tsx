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
import { AnalyticsTracker } from './features/analytics/hooks/AnalyticsTracker';
// import { LoadingSpinner } from './components/LoadingSpinner';
import { CookieConsentBanner } from './features/analytics/components/CookieConsentBanner';
import { Toaster } from './components/ui/toast';
import { useAuthSession } from './features/auth/hooks/useAuthSession';
import { InitialLoader } from './components/InitialLoader';

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
		return <InitialLoader />;
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
