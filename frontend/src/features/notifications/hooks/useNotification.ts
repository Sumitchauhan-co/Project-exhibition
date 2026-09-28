import { useCallback, useEffect, useState } from 'react';

import {
	getNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from '../api';
import type { Notification } from '../types/notification';

export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState<string | null>(null);

	const unreadCount = notifications.filter(
		(notification) => !notification.is_read,
	).length;

	const fetchNotifications = useCallback(async () => {
		try {
			setError(null);

			const data = await getNotifications();

			setNotifications(data);
		} catch (error) {
			console.error('Failed to fetch notifications:', error);

			setError('Failed to load notifications.');
		} finally {
			setLoading(false);
		}
	}, []);

	const markAsRead = useCallback(async (id: number) => {
		try {
			const updated = await markNotificationAsRead(id);

			setNotifications((current) =>
				current.map((notification) =>
					notification.id === id ? updated : notification,
				),
			);
		} catch (error) {
			console.error('Failed to mark notification as read:', error);
		}
	}, []);

	const markAllAsRead = useCallback(async () => {
		try {
			await markAllNotificationsAsRead();

			setNotifications((current) =>
				current.map((notification) => ({
					...notification,
					is_read: true,
				})),
			);
		} catch (error) {
			console.error('Failed to mark notifications as read:', error);
		}
	}, []);

	useEffect(() => {
		fetchNotifications();

		const interval = window.setInterval(fetchNotifications, 60_000);

		return () => window.clearInterval(interval);
	}, [fetchNotifications]);

	return {
		notifications,
		unreadCount,
		loading,
		error,
		refetch: fetchNotifications,
		markAsRead,
		markAllAsRead,
	};
}
