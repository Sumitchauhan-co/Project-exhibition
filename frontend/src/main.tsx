// import { StrictMode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { queryClient } from './lib/queryClient';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
	// <StrictMode>
	<QueryClientProvider client={queryClient}>
		<GoogleOAuthProvider clientId="957998856648-f2n19q28o0rhqu22f047u19ab9rpnb2u.apps.googleusercontent.com">
			<App />
		</GoogleOAuthProvider>
	</QueryClientProvider>,
	// </StrictMode>,
);
