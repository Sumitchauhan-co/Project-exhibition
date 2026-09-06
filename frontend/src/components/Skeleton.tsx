export const MetricSkeleton = () => (
	<div className="animate-pulse space-y-3 rounded-xl border border-border bg-card p-5">
		<div className="h-4 w-24 rounded bg-muted" />
		<div className="h-8 w-16 rounded bg-muted/80" />
	</div>
);

export const ChartSkeleton = () => (
	<div className="flex h-105 animate-pulse flex-col justify-between rounded-xl border border-border bg-card p-6">
		<div className="h-6 w-48 rounded bg-muted" />
		<div className="flex items-end gap-3 h-64">
			{[
				42, 58, 35, 67, 51, 74, 46, 63, 38, 70, 55, 44, 61, 49, 76, 53, 64, 41,
			].map((height, i) => (
				<div
					key={i}
					className="w-full rounded-t bg-muted"
					style={{ height: `${height}%` }}
				/>
			))}
		</div>
	</div>
);
