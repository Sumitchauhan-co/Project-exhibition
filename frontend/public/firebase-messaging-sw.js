importScripts(
	'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
);

importScripts(
	'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js',
);

firebase.initializeApp({
	apiKey: 'AIzaSyB8TOuQ7ack0jMc7RvXKP1_miyQlyjDNRg',
	authDomain: 'rag-matrix-361c3.firebaseapp.com',
	projectId: 'rag-matrix-361c3',
	storageBucket: 'rag-matrix-361c3.firebasestorage.app',
	messagingSenderId: '601951945082',
	appId: '1:601951945082:web:c9e49e0d15f20ade4156c3',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	const title = payload.notification?.title ?? 'RAG Benchmark';

	const options = {
		body: payload.notification?.body ?? 'You have a new notification.',

		data: payload.data ?? {},

		icon: '/favicon-192x192.png',
		badge: '/favicon-192x192.png',
	};

	self.registration.showNotification(title, options);
});
