import { motion } from 'framer-motion';
import { BrandLogo } from './BrandLogo';

interface InitialLoaderProps {
	label?: string;
}

export function InitialLoader({
	label = 'Initializing System',
}: InitialLoaderProps) {
	return (
		<div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-white px-6 py-8 selection:bg-none">
			{/* Spacer to keep central loader perfectly centered */}
			<div className="h-6" />

			{/* Main Spinner & Progress Bar */}
			<div className="flex flex-col items-center gap-6">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
					className="flex items-center justify-center"
				>
					<BrandLogo
						size="lg"
						showText={false}
					/>
				</motion.div>

				<div className="flex flex-col items-center gap-2.5">
					<span className="text-sm font-medium tracking-wide text-slate-400">
						{label}
					</span>

					<div className="relative h-0.5 w-full overflow-hidden rounded-full bg-slate-100">
						<motion.div
							animate={{
								x: ['-100%', '100%'],
							}}
							transition={{
								duration: 1.6,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
							className="h-full w-full bg-blue-600/80"
						/>
					</div>
				</div>
			</div>

			{/* Static, Enhanced Bottom Notice */}
			<div className="max-w-xs text-center">
				<p className="text-xs leading-relaxed text-slate-400">
					<span className="font-semibold text-slate-500">Note:</span> Server is
					waking up from an idle state. Initial connection may take up to few
					minutes.
				</p>
			</div>
		</div>
	);
}
