import React, { useEffect } from 'react';

declare global {
	interface Window {
		adsbygoogle: any[];
	}
}

interface AdBannerProps {
	slot?: string;
	format?: 'auto' | 'fluid' | 'rectangle';
	responsive?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
	slot = import.meta.env.VITE_ADSENSE_AD_SLOT,
	format = 'auto',
	responsive = true,
}) => {
	const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

	useEffect(() => {
		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		} catch (err) {
			console.error('AdSense display error:', err);
		}
	}, []);

	if (!clientId || !slot) {
		return null;
	}

	return (
		<div className="my-4 flex justify-center overflow-hidden">
			<ins
				className="adsbygoogle"
				style={{ display: 'block' }}
				data-ad-client={clientId}
				data-ad-slot={slot}
				data-ad-format={format}
				data-full-width-responsive={responsive ? 'true' : 'false'}
			/>
		</div>
	);
};
