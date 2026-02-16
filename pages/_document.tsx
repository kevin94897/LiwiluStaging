import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				{/* Google Tag Manager */}
				{process.env.NEXT_PUBLIC_DEBUG === 'false' && (
					<script
						dangerouslySetInnerHTML={{
							__html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PB38QZWS');`,
						}}
					/>
				)}
				{/* End Google Tag Manager */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
			</Head>
			<body className="antialiased">
				{/* Google Tag Manager (noscript) */}
				{process.env.NEXT_PUBLIC_DEBUG === 'false' && (
					<noscript>
						<iframe
							src="https://www.googletagmanager.com/ns.html?id=GTM-PB38QZWS"
							height="0"
							width="0"
							style={{ display: 'none', visibility: 'hidden' }}
						></iframe>
					</noscript>
				)}
				{/* End Google Tag Manager (noscript) */}
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
