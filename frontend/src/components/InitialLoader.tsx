import { motion } from 'framer-motion';
import { BrandLogo } from './BrandLogo';

interface InitialLoaderProps {
	label?: string;
}

export function InitialLoader({
	label = 'Initializing System',
}: InitialLoaderProps) {
	return (
		<div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white selection:bg-none">
			<div className="flex flex-col items-center gap-6">
				{/* Animated Brand Logo Container */}
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

				{/* Minimal Subtitle & Subdued Progress Bar */}
				<div className="flex flex-col items-center gap-2.5">
					<span className="text-xs font-medium tracking-wide text-slate-400">
						{label}
					</span>

					{/* Hairline Progress Indicator */}
					<div className="relative h-[2px] w-24 overflow-hidden rounded-full bg-slate-100">
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
		</div>
	);
}
