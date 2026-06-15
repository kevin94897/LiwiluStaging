import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';
import { useMayorista } from '@/context/MayoristaContext';

interface LayoutProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
	background?: boolean;
}

export default function Layout({ title, description, children, background }: LayoutProps) {
	const { isMayorista } = useMayorista();
	return (
		<>
			<Head>
				<title>{title || 'Liwilu - Tu compra, nuestro compromiso'}</title>
				<meta
					name="description"
					content={description || 'Uniformes, útiles y más'}
				/>
			</Head>

			<div className="min-h-screen flex flex-col bg-gray-50 relative overflow-x-hidden">
				<Header />

				<main className={`flex-grow ${isMayorista ? 'mt-[166px] lg:mt-[121px]' : 'mt-[130px] lg:mt-[85px]'} relative`}>
					{background && (
						<div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden z-10 pointer-events-none hidden lg:block">
							<div className="absolute -right-60 md:-right-32 top-30 md:top-32 w-auto">
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
						</div>
					)}
					{children}
				</main>
				<Footer />
			</div>
		</>
	);
}
