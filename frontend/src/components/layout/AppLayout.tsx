import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Banner } from '../Banner';

export const AppLayout: React.FC = () => {
	const isProd = import.meta.env.VITE_APP_ENV === 'prod';
	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-slate-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
			{isProd && <Banner />}
			<Navbar />

			<main className="flex-1">
				<Outlet />
			</main>

			<Footer />
		</div>
	);
};
