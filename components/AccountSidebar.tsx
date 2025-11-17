// components/AccountSidebar.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';

interface AccountSidebarProps {
	activeSection?: string;
}

export default function AccountSidebar({ activeSection }: AccountSidebarProps) {
	const router = useRouter();

	const menuItems = [
		{ id: 'mi-cuenta', label: 'Mi cuenta', href: '/mi-cuenta' },
		{ id: 'mis-datos', label: 'Mis datos', href: '/mi-cuenta/mis-datos' },
		{ id: 'direcciones', label: 'Direcciones', href: '/mi-cuenta/direcciones' },
		{ id: 'mis-pedidos', label: 'Mis pedidos', href: '/mi-cuenta/mis-pedidos' },
		{
			id: 'mis-favoritos',
			label: 'Mis favoritos',
			href: '/mi-cuenta/mis-favoritos',
		},
	];

	const handleLogout = () => {
		// Aquí iría la lógica de cierre de sesión
		console.log('Cerrando sesión...');
		router.push('/');
	};

	return (
		<aside className="lg:w-80 ">
			<h2 className="text-2xl md:text-4xl font-semibold pb-4 text-center block lg:hidden">
				Mi cuenta
			</h2>
			<nav className="bg-white rounded-2xl shadow-sm overflow-hidden">
				{menuItems.map((item, index) => {
					const isActive = activeSection === item.id;
					return (
						<Link
							key={item.id}
							href={item.href}
							className={`
								flex items-center justify-between px-6 py-4 
								transition-colors duration-200
								${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}
								${index !== menuItems.length ? 'border-b border-gray-100' : ''}
							`}
						>
							<span className="font-medium">{item.label}</span>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</Link>
					);
				})}

				{/* Cerrar sesión */}
				<button
					onClick={handleLogout}
					className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-left"
				>
					<span className="font-medium">Cerrar sesión</span>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			</nav>
		</aside>
	);
}
