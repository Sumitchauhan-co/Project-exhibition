import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
	interface Window {
		gtag?: (...args: any[]) => void;
	}
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const AnalyticsTracker: React.FC = () => {
	const location = useLocation();

	useEffect(() => {
		const consent = localStorage.getItem('cookie_consent_status');
		if (consent !== 'accepted' || !GA_MEASUREMENT_ID) return;
		if (typeof window.gtag !== 'function') return;

		window.gtag('event', 'page_view', {
			page_location: window.location.href,
			page_path: location.pathname + location.search,
			page_title: document.title || 'RAG Dashboard',
		});
	}, [location.pathname, location.search]);

	return null;
};
