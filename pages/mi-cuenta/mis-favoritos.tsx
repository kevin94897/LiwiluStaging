import { useEffect, useState } from 'react';
import { showToast } from '@/lib/notifications';

import Layout from '@/components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import AccountSidebar from '@/components/AccountSidebar';
import { getFavorites, FavoriteProduct, toggleFavorite, getFavoritesCount } from '@/lib/catalog';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MisFavoritos() {
	const [favoritos, setFavoritos] = useState<FavoriteProduct[]>([]);
	const [favoritesCount, setFavoritesCount] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [removingId, setRemovingId] = useState<number | null>(null);

	useEffect(() => {
		async function fetchFavorites() {
			try {
				const response = await getFavorites();
				if (response.success) {
					setFavoritos(response.data);

					// Fetch count
					const countResponse = await getFavoritesCount();
					setFavoritesCount(countResponse.count);
				} else {
					setError('No se pudieron cargar los favoritos.');
				}
			} catch (err) {
				console.error(err);
				setError('Error al cargar favoritos.');
			} finally {
				setLoading(false);
			}
		}

		fetchFavorites();
	}, []);

	const handleRemoveFavorite = async (productId: number) => {
		try {
			setRemovingId(productId);
			await toggleFavorite(productId);

			// Remove from local state
			setFavoritos(prev => prev.filter(p => p.id !== productId));
			setFavoritesCount(prev => Math.max(0, prev - 1));
			showToast('Producto eliminado de favoritos');
		} catch (err) {
			console.error('Error removing favorite:', err);
			showToast('Error al eliminar de favoritos', 'error');
		} finally {
			setRemovingId(null);
		}
	};

	return (
		<ProtectedRoute>
			<Layout
				title="Mis favoritos - Liwilu"
				description="Tus productos favoritos"
				background={true}
			>
				<div className="min-h-screen py-8">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex flex-col lg:flex-row gap-6">
							<AccountSidebar activeSection="mis-favoritos" />

							<main className="flex-1">
								<div className="md:px-8 z-10 relative">
									<h1 className="text-xl md:text-4xl font-semibold mb-8 border-b pb-4">
										Mis favoritos <span className="text-gray-500 text-lg">({favoritesCount})</span>
									</h1>

									{loading ? (
										<div className="flex justify-center py-20">
											<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
										</div>
									) : error ? (
										<div className="text-center py-12 text-red-500">
											<p>{error}</p>
										</div>
									) : (
										<>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
												{favoritos.map((producto) => (
													<div
														key={producto.id}
														className="rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition bg-white"
													>
														{/* Imagen del producto */}
														<div className="relative">
															<div className="relative w-full h-64">
																<Image
																	src={producto.coverImage || '/images/placeholder.png'}
																	alt={producto.name}
																	fill
																	className="object-cover"
																	unoptimized
																/>
															</div>

															{/* Botón de favorito (clickable para remover) */}
															<button
																onClick={() => handleRemoveFavorite(producto.id)}
																disabled={removingId === producto.id}
																className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition disabled:opacity-50"
																title="Quitar de favoritos"
															>
																{removingId === producto.id ? (
																	<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
																) : (
																	<svg
																		className="w-6 h-6 text-primary fill-current"
																		fill="currentColor"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
																		/>
																	</svg>
																)}
															</button>
														</div>

														{/* Info del producto */}
														<div className="p-4 bg-primary text-white">
															<p className="font-normal text-sm opacity-90">
																{producto.defaultCategory?.name || 'Producto'}
															</p>

															<Link href={`/producto/${producto.prestashopId}`}>
																<h3 className="font-normal text-lg hover:underline cursor-pointer truncate">
																	{producto.name}
																</h3>
															</Link>

															{/* Rating Placeholder */}
															<div className="flex text-yellow-300">
																{'★'.repeat(5)}
															</div>

															{/* Precio */}
															<div className="flex items-baseline gap-2 mb-4">
																<span className="text-xl md:text-2xl font-semibold">
																	s/ {producto.discountPrice
																		? producto.discountPrice.toFixed(2)
																		: producto.priceWithTax.toFixed(2)}
																</span>
																{producto.discountPrice && (
																	<span className="line-through text-sm opacity-75">
																		s/ {producto.priceWithTax.toFixed(2)}
																	</span>
																)}
															</div>
														</div>
													</div>
												))}
											</div>

											{favoritos.length === 0 && (
												<div className="text-center py-12">
													<p className="text-gray-500 text-lg mb-4">
														No tienes productos en favoritos
													</p>
													<Link
														href="/productos"
														className="text-primary hover:text-primary-dark font-semibold"
													>
														Explorar productos →
													</Link>
												</div>
											)}
										</>
									)}

									{/* Botón volver */}
									<div className="flex flex-col-reverse md:flex-row justify-between mt-8 pt-6 border-t gap-6 text-center items-center">
										<Link
											href="/mi-cuenta"
											className="text-gray-500 hover:text-gray-700 font-medium"
										>
											Volver
										</Link>
									</div>
								</div>
							</main>
						</div>
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
}
