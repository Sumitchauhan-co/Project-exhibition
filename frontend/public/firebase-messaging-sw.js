importScripts(
	'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
);

importScripts(
	'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js',
);

firebase.initializeApp({
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	const title = payload.notification?.title ?? 'RAG Benchmark';

	const options = {
		body: payload.notification?.body ?? 'You have a new notification.',

		data: payload.data ?? {},

		icon: '/icon-192.png',
	};

	self.registration.showNotification(title, options);
});
