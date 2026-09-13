import ReactGA from 'react-ga4';

// Replace with your actual GA4 Measurement ID (e.g., 'G-XXXXXXXXXX')
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/**
 * Initializes Google Analytics with default consent set to 'denied'.
 */
export const initGA = (): void => {
	if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

	// Set default consent mode to denied before loading scripts
	if (typeof window.gtag === 'function') {
		window.gtag('consent', 'default', {
			analytics_storage: 'denied',
			ad_storage: 'denied',
		});
	}

	ReactGA.initialize(GA_MEASUREMENT_ID);
};

/**
 * Updates Google Analytics consent status dynamically.
 */
export const updateGAConsent = (granted: boolean): void => {
	if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
		window.gtag('consent', 'update', {
			analytics_storage: granted ? 'granted' : 'denied',
		});
	}
};

/**
 * Tracks custom user interactions/events.
 */
export const trackEvent = (
	category: string,
	action: string,
	label?: string,
): void => {
	const consent = localStorage.getItem('cookie_consent_status');
	if (consent === 'accepted') {
		ReactGA.event({ category, action, label });
	}
};
