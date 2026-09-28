import { Bell, CheckCheck } from 'lucide-react';

import type { Notification } from '../types/notification';
import { NotificationItem } from './NotificationItem';

interface NotificationPanelProps {
	notifications: Notification[];
	loading: boolean;
	onRead: (id: number) => void;
	onMarkAllRead: () => void;
}

export function NotificationPanel({
	notifications,
	loading,
	onRead,
	onMarkAllRead,
}: NotificationPanelProps) {
	const hasUnread = notifications.some((notification) => !notification.is_read);

	return (
		<div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-96 overflow-hidden rounded-xl border bg-background shadow-xl">
			{/* Header */}
			<div className="flex items-center justify-between border-b px-4 py-3">
				<div className="flex items-center gap-2">
					<Bell className="size-4 text-muted-foreground" />

					<h2 className="text-sm font-semibold">Notifications</h2>

					{hasUnread && (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
							{
								notifications.filter((notification) => !notification.is_read)
									.length
							}
						</span>
					)}
				</div>

				{hasUnread && (
					<button
						type="button"
						onClick={onMarkAllRead}
						className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
					>
						<CheckCheck className="size-3.5" />
						Mark all as read
					</button>
				)}
			</div>

			{/* Notifications */}
			<div className="max-h-[28rem] overflow-y-auto">
				{loading ? (
					<div className="flex flex-col items-center justify-center px-6 py-12 text-center">
						<div className="mb-3 size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />

						<p className="text-sm text-muted-foreground">
							Loading notifications...
						</p>
					</div>
				) : notifications.length === 0 ? (
					<div className="flex flex-col items-center justify-center px-6 py-12 text-center">
						<div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
							<Bell className="size-5 text-muted-foreground" />
						</div>

						<p className="text-sm font-medium">You're all caught up</p>

						<p className="mt-1 text-xs text-muted-foreground">
							No new notifications right now.
						</p>
					</div>
				) : (
					notifications.map((notification) => (
						<NotificationItem
							key={notification.id}
							notification={notification}
							onRead={onRead}
						/>
					))
				)}
			</div>
		</div>
	);
}
