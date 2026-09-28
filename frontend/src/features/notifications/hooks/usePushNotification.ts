import { useEffect } from 'react';

import { registerWebPush, setupForegroundNotifications } from '../firebase';

export function usePushNotifications() {
	useEffect(() => {
		let unsubscribe: (() => void) | undefined;

		const setup = async () => {
			try {
				// Register this browser/device with FCM.
				const token = await registerWebPush();

				if (token) {
					console.log('FCM web push registered successfully');
				}

				// Listen for FCM messages while the website
				// is open and in the foreground.
				unsubscribe = await setupForegroundNotifications((payload) => {
					console.log('🔥 Foreground FCM notification received:', payload);
				});

				console.log('✅ Foreground FCM listener registered');
			} catch (error) {
				console.error('Failed to setup web push notifications:', error);
			}
		};

		void setup();

		return () => {
			unsubscribe?.();
		};
	}, []);
}
