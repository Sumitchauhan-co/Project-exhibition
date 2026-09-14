import { Galaxy } from 'lucide-react';

interface BrandLogoProps {
	label?: string;
	size?: 'sm' | 'md' | 'lg';
	showText?: boolean;
	className?: string;
}

export function BrandLogo({
	label = 'RAG MATRIX',
	size = 'md',
	showText = true,
	className = '',
}: BrandLogoProps) {
	const sizeClasses = {
		sm: { icon: 'h-6 w-6', text: 'text-xs' },
		md: { icon: 'h-8 w-8', text: 'text-sm font-semibold' },
		lg: { icon: 'h-12 w-12', text: 'text-base font-semibold' },
	}[size];

	return (
		<div className={`group inline-flex items-center gap-3 ${className}`}>
			{/* Standalone Icon without Frame */}
			<Galaxy className={`text-blue-600 ${sizeClasses.icon} shrink-0`} />

			{/* Optional Brand Text */}
			{showText && label && (
				<span
					className={`tracking-wider text-slate-800 uppercase ${sizeClasses.text}`}
				>
					{label}
				</span>
			)}
		</div>
	);
}
