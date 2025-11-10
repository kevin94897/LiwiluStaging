const PRESTASHOP_URL = 'https://prestaliwilu.nerdstudiolab.com';
const API_KEY = 'UHYQHJRLSVS48ESSFANPDHA1EZ8HATYB';

export interface Product {
	id: string;
	name?: Array<{ value: string }>;
	description?: Array<{ value: string }>;
	price?: string;
	quantity?: number;
	reference?: string;
	id_category_default?: string;
	category_name?: string;
	associations?: {
		images?: Array<{ id: string }>;
		categories?: Array<{ id: string }>;
	};
}

export interface Category {
	id: string;
	name?: Array<{ value: string }>;
}

// Headers con autenticación
const getHeaders = () => {
	const auth = Buffer.from(`${API_KEY}:`).toString('base64');
	return {
		Authorization: `Basic ${auth}`,
		'Output-Format': 'JSON',
	};
};

// Obtener productos (versión para servidor)
export async function getProducts(limit: number = 20): Promise<Product[]> {
	try {
		console.log('🔄 Obteniendo productos...');

		const timestamp = Date.now();

		const response = await fetch(
			`${PRESTASHOP_URL}/api/products?display=full&limit=${limit}&_t=${timestamp}`,
			{
				headers: getHeaders(),
				cache: 'no-store',
				next: {
					revalidate: 0, // Fuerza revalidación inmediata
					tags: ['products'], // Para revalidación manual si la necesitas
				},
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Error de PrestaShop:', response.status, errorText);
			throw new Error(`Error ${response.status}: ${errorText}`);
		}

		const data = await response.json();
		console.log('✅ Productos recibidos:', data.products?.length || 0);

		return data.products || [];
	} catch (error) {
		console.error('💥 Error al obtener productos:', error);
		return [];
	}
}

// Obtener categorías
export async function getCategories(): Promise<Category[]> {
	try {
		console.log('🔄 Obteniendo categorías...');
		const timestamp = Date.now();
		const response = await fetch(
			`${PRESTASHOP_URL}/api/categories?display=full&output_format=JSON&ws_key=${process.env.PRESTASHOP_API_KEY}&_t=${timestamp}`,
			{
				headers: getHeaders(),
				cache: 'no-store',
			}
		);

		if (!response.ok) {
			throw new Error(`Error al obtener categorías: ${response.status}`);
		}

		const data = await response.json();
		console.log('✅ Categorías recibidas:', data.categories?.length || 0);

		return data.categories || [];
	} catch (error) {
		console.error('💥 Error al obtener categorías:', error);
		return [];
	}
}

// Obtener productos destacados
export async function getFeaturedProducts(): Promise<Product[]> {
	try {
		const products = await getProducts(8);
		return products.slice(0, 8);
	} catch (error) {
		console.error('Error:', error);
		return [];
	}
}

// Obtener productos relacionados por categoría o producto
// Obtener productos relacionados por categoría
export async function getRelatedProducts(
	categoryId?: string | null,
	excludeProductId?: string | null,
	limit: number = 8
): Promise<Product[]> {
	try {
		console.log('🔄 Obteniendo productos relacionados...');
		console.log('📦 Categoría:', categoryId);
		console.log('🚫 Excluir producto:', excludeProductId);

		const timestamp = Date.now();

		// 🔹 URL base
		let url = `${PRESTASHOP_URL}/api/products?display=full&output_format=JSON&ws_key=${API_KEY}&_t=${timestamp}`;

		// ✅ Filtrar por categoría si existe
		if (categoryId) {
			url += `&filter[id_category_default]=[${categoryId}]`;
		}
		url += `&limit=${limit}`;

		console.log('🔗 URL:', url);

		const response = await fetch(url, {
			headers: getHeaders(),
			cache: 'no-store',
			next: { revalidate: 0 },
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(
				'❌ Error al obtener productos relacionados:',
				response.status,
				errorText
			);

			// 🔹 Si falla el filtro específico, intentar obtener productos generales
			console.log('⚠️ Intentando obtener productos sin filtros específicos...');
			const fallbackUrl = `${PRESTASHOP_URL}/api/products?display=full&output_format=JSON&ws_key=${API_KEY}&limit=${limit}&_t=${timestamp}`;

			const fallbackResponse = await fetch(fallbackUrl, {
				headers: getHeaders(),
				cache: 'no-store',
			});

			if (fallbackResponse.ok) {
				const fallbackData = await fallbackResponse.json();
				let products = fallbackData.products || [];

				// Excluir manualmente el producto actual
				if (excludeProductId) {
					products = products.filter((p: Product) => p.id !== excludeProductId);
				}

				console.log('✅ Productos fallback obtenidos:', products.length);
				return products.slice(0, limit);
			}

			return [];
		}

		const data = await response.json();
		const products = data.products || [];

		console.log('✅ Productos relacionados obtenidos:', products.length);

		return products;
	} catch (error) {
		console.error('💥 Error en getRelatedProducts:', error);

		// 🔹 Como último recurso, intentar obtener cualquier producto
		try {
			console.log('⚠️ Último intento: obteniendo productos aleatorios...');
			const products = await getProducts(limit);

			// Excluir el producto actual
			if (excludeProductId) {
				return products
					.filter((p) => p.id !== excludeProductId)
					.slice(0, limit);
			}

			return products.slice(0, limit);
		} catch (fallbackError) {
			console.error('💥 Error en fallback:', fallbackError);
			return [];
		}
	}
}
// URL de imagen del producto
export function getProductImageUrl(productId: string, imageId: string): string {
	return `${PRESTASHOP_URL}/api/images/products/${productId}/${imageId}?ws_key=${API_KEY}`;
}

// Obtener un producto específico por ID
export async function getProduct(id: string): Promise<Product> {
	try {
		const timestamp = Date.now();
		const response = await fetch(
			`${PRESTASHOP_URL}/api/products/${id}?output_format=JSON&ws_key=${process.env.PRESTASHOP_API_KEY}&_t=${timestamp}`,
			{
				headers: getHeaders(),
				cache: 'no-store',
				next: { revalidate: 0 },
			}
		);

		if (!response.ok) {
			throw new Error(`Error al obtener producto: ${response.status}`);
		}

		const data = await response.json();
		return data.product;
	} catch (error) {
		console.error('💥 Error al obtener producto:', error);
		throw error;
	}
}

// Formatear precio
export function formatPrice(
	price: string | number,
	currency: string = 'S/'
): string {
	const numPrice = typeof price === 'string' ? parseFloat(price) : price;
	return `${currency} ${numPrice.toFixed(2)}`;
}

// export async function getProductById(id: string) {
// 	const response = await fetch(
// 		`${process.env.PRESTASHOP_API_URL}/products/${id}?output_format=JSON&ws_key=${process.env.PRESTASHOP_API_KEY}`
// 	);

// 	if (!response.ok) {
// 		throw new Error('No se pudo obtener el producto');
// 	}

// 	const data = await response.json();
// 	return data.product;
// }
