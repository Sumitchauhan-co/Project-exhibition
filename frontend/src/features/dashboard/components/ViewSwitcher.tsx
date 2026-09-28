import React from 'react';
import { BarChart3, Table } from 'lucide-react';

interface ViewSwitcherProps {
	activeTab: 'chart' | 'table';
	onChangeTab: (tab: 'chart' | 'table') => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
	activeTab,
	onChangeTab,
}) => (
	<div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
		<button
			onClick={() => onChangeTab('chart')}
			className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
				activeTab === 'chart'
					? 'bg-background text-foreground shadow-sm'
					: 'text-muted-foreground hover:text-foreground'
			}`}
		>
			<BarChart3 className="w-3.5 h-3.5" /> Chart View
		</button>
		<button
			onClick={() => onChangeTab('table')}
			className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
				activeTab === 'table'
					? 'bg-background text-foreground shadow-sm'
					: 'text-muted-foreground hover:text-foreground'
			}`}
		>
			<Table className="w-3.5 h-3.5" /> Matrix Table
		</button>
	</div>
);
