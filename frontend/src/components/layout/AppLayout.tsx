import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

export const AppLayout: React.FC = () => {
	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-slate-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
			<Navbar />

			<main className="flex-1">
				<Outlet />
			</main>

			<Footer />
		</div>
	);
};
