import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';

interface LayoutProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
	background?: boolean;
}

export default function Layout({ title, description, children, background }: LayoutProps) {
	return (
		<>
			<Head>
				<title>{title || 'Liwilu - Compra por MAYOR'}</title>
				<meta
					name="description"
					content={description || 'Liwilu - Tienda por mayor'}
				/>
			</Head>

			<div className="min-h-screen flex flex-col bg-gray-50 relative overflow-hidden">
				<Header />

				<main className="flex-grow mt-[135px] lg:mt-[85px] overflow-hidden relative" >
					{background && (
						<div className="absolute -right-60 md:-right-32 top-30 md:top-32 w-auto z-10 pointer-events-none hidden lg:block">
							<Image
								src="/images/vectores/liwilu_banner_productos_vector_04.png"
								alt="background decoration"
								width={408}
								height={427}
								quality={100}
								className="h-auto"
								priority
							/>
						</div>
					)}
					{children}
				</main>
				<Footer />
			</div>
		</>
	);
}
