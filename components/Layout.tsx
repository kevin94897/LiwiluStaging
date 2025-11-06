import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
}

export default function Layout({ title, description, children }: LayoutProps) {
	return (
		<>
			<Head>
				<title>{title || 'Liwilu - Compra por MAYOR'}</title>
				<meta
					name="description"
					content={description || 'Liwilu - Tienda por mayor'}
				/>
			</Head>

			<div className="min-h-screen flex flex-col bg-white">
				<Header />
				<main className="flex-grow mt-[150px] lg:mt-[92px]">{children}</main>
				<Footer />
			</div>
		</>
	);
}
