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

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

export default function App() {
	return (
		<ThemeProvider
			defaultTheme="dark"
			storageKey="rag-dashboard-theme"
		>
			<BrowserRouter>
				<main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 transition-colors">
					<AppRoutes />
				</main>
			</BrowserRouter>
		</ThemeProvider>
	);
}
