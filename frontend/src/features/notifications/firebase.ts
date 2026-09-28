import { getToken, onMessage } from 'firebase/messaging';

import { getFirebaseMessaging } from '@/lib/firebase';

import { registerNotificationDevice } from './api';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function registerWebPush(): Promise<string | null> {
	if (!('Notification' in window)) {
		console.warn('Browser notifications are not supported.');
		return null;
	}

	if (!VAPID_KEY) {
		console.error('VITE_FIREBASE_VAPID_KEY is missing.');
		return null;
	}

	const messaging = await getFirebaseMessaging();

	if (!messaging) {
		console.warn('Firebase Messaging is not supported.');
		return null;
	}

	let permission = Notification.permission;

	if (permission === 'default') {
		permission = await Notification.requestPermission();
	}

	if (permission !== 'granted') {
		console.warn('Notification permission was not granted.');
		return null;
	}

	const token = await getToken(messaging, {
		vapidKey: VAPID_KEY,
	});

	if (!token) {
		console.warn('Firebase did not return an FCM token.');
		return null;
	}

	await registerNotificationDevice(token, 'web');

	return token;
}

export async function setupForegroundNotifications(
	onNotification: (payload: { title?: string; body?: string }) => void,
): Promise<() => void> {
	if (!('Notification' in window)) {
		console.warn('Browser notifications are not supported.');

		return () => {};
	}

	const messaging = await getFirebaseMessaging();

	if (!messaging) {
		console.warn('Firebase Messaging is not supported.');

		return () => {};
	}

	return onMessage(messaging, (payload) => {
		console.log('🔥 FCM foreground message:', payload);

		const title =
			payload.notification?.title ??
			payload.data?.title ??
			'RAG Benchmark Studio';

		const body =
			payload.notification?.body ??
			payload.data?.body ??
			'Your evaluation has completed.';

		// Notify the React application.
		onNotification({
			title,
			body,
		});

		// Show browser notification when the app
		// is currently in the foreground.
		if (Notification.permission === 'granted') {
			const notification = new Notification(title, {
				body,
				icon: '/icon-192.png',
				tag: `rag-benchmark-${Date.now()}`,
			});

			notification.onclick = () => {
				window.focus();
				notification.close();
			};
		}
	});
}
