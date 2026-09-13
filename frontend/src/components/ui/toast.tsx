import * as React from 'react';
import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import { cn } from 'cn';

import { Button } from '@/components/ui/button';
import {
	XIcon,
	CircleCheckIcon,
	InfoIcon,
	TriangleAlertIcon,
	OctagonXIcon,
	Loader2Icon,
} from 'lucide-react';

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
	return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
	return (
		<ToastPrimitive.Portal
			data-slot="toast-portal"
			{...props}
		/>
	);
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
	return (
		<ToastPrimitive.Viewport
			data-slot="toast-viewport"
			className={cn(
				'pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-[360px]',
				className,
			)}
			{...props}
		/>
	);
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
	const toastType =
		props.toast && 'type' in props.toast ? String(props.toast.type) : undefined;

	return (
		<ToastPrimitive.Root
			data-slot="toast"
			data-type={toastType}
			className={cn(
				'group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border border-blue-200 bg-white/95 text-slate-900 shadow-lg shadow-blue-500/10 will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
				'dark:border-blue-500/30 dark:bg-slate-900/95 dark:text-slate-50',
				'data-[type=success]:border-emerald-200 data-[type=success]:bg-emerald-50/95 data-[type=success]:text-emerald-950 dark:data-[type=success]:border-emerald-500/40 dark:data-[type=success]:bg-emerald-950/70 dark:data-[type=success]:text-emerald-100',
				'data-[type=error]:border-rose-200 data-[type=error]:bg-rose-50/95 data-[type=error]:text-rose-950 dark:data-[type=error]:border-rose-500/40 dark:data-[type=error]:bg-rose-950/70 dark:data-[type=error]:text-rose-100',
				'data-[type=warning]:border-amber-200 data-[type=warning]:bg-amber-50/95 data-[type=warning]:text-amber-950 dark:data-[type=warning]:border-amber-500/40 dark:data-[type=warning]:bg-amber-950/70 dark:data-[type=warning]:text-amber-100',
				'data-[type=info]:border-blue-200 data-[type=info]:bg-blue-50/95 data-[type=info]:text-blue-950 dark:data-[type=info]:border-blue-500/40 dark:data-[type=info]:bg-blue-950/70 dark:data-[type=info]:text-blue-100',
				'[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]',
				'h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]',
				"after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
				'data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
				'data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]',
				'[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]',
				'data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
				'data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
				'data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
				'data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
				'data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
				'data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
				'data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
				'data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
				className,
			)}
			{...props}
		/>
	);
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
	return (
		<ToastPrimitive.Content
			data-slot="toast-content"
			className={cn(
				'flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100',
				className,
			)}
			{...props}
		/>
	);
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
	return (
		<ToastPrimitive.Title
			data-slot="toast-title"
			className={cn('text-sm font-medium', className)}
			{...props}
		/>
	);
}

function ToastDescription({
	className,
	...props
}: ToastPrimitive.Description.Props) {
	return (
		<ToastPrimitive.Description
			data-slot="toast-description"
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}

function ToastAction({
	className,
	render = (
		<Button
			variant="outline"
			size="sm"
		/>
	),
	...props
}: ToastPrimitive.Action.Props) {
	return (
		<ToastPrimitive.Action
			data-slot="toast-action"
			render={render}
			className={cn('shrink-0', className)}
			{...props}
		/>
	);
}

function ToastClose({
	className,
	children,
	render = (
		<Button
			variant="ghost"
			size="icon-sm"
		/>
	),
	...props
}: ToastPrimitive.Close.Props) {
	return (
		<ToastPrimitive.Close
			data-slot="toast-close"
			aria-label="Close toast"
			render={render}
			className={cn(
				"relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
				className,
			)}
			{...props}
		>
			{children ?? <XIcon aria-hidden="true" />}
		</ToastPrimitive.Close>
	);
}

function ToastIcon({ type }: { type: string | undefined }) {
	let icon: React.ReactNode = null;

	if (type === 'success') {
		icon = <CircleCheckIcon aria-hidden="true" />;
	}

	if (type === 'info') {
		icon = <InfoIcon aria-hidden="true" />;
	}

	if (type === 'warning') {
		icon = <TriangleAlertIcon aria-hidden="true" />;
	}

	if (type === 'error') {
		icon = (
			<OctagonXIcon
				className="text-destructive"
				aria-hidden="true"
			/>
		);
	}

	if (type === 'loading') {
		icon = (
			<Loader2Icon
				className="animate-spin"
				aria-hidden="true"
			/>
		);
	}

	if (!icon) {
		return null;
	}

	return (
		<span
			data-slot="toast-icon"
			className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
		>
			{icon}
		</span>
	);
}

function ToastList() {
	const { toasts } = ToastPrimitive.useToastManager();

	return toasts.map((toastItem) => (
		<Toast
			key={toastItem.id}
			toast={toastItem}
		>
			<ToastContent>
				<ToastIcon type={toastItem.type} />
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<ToastTitle />
					<ToastDescription />
				</div>
				<ToastAction />
				<ToastClose />
			</ToastContent>
		</Toast>
	));
}

function Toaster({
	children,
	toastManager = toast,
	...props
}: ToastPrimitive.Provider.Props) {
	return (
		<ToastProvider
			toastManager={toastManager}
			{...props}
		>
			{children}
			<ToastPortal>
				<ToastViewport>
					<ToastList />
				</ToastViewport>
			</ToastPortal>
		</ToastProvider>
	);
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
	Toaster,
	Toast,
	ToastAction,
	ToastClose,
	ToastContent,
	ToastDescription,
	ToastPortal,
	ToastProvider,
	ToastTitle,
	ToastViewport,
	createToastManager,
	toast,
	useToastManager,
};
