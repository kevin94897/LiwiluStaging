// lib/prestashop.ts
const PRESTASHOP_URL = 'https://prestaliwilu.nerdstudiolab.com';
const API_KEY = 'TKHWZ8XDXVFHHSSACPI73EDG731K4DI4';

export interface Product {
	id: string | number; // Note: catalog returns number, prestashop returns string
	name?: Array<{ value: string }> | string;
	description?: Array<{ value: string }> | string;
	price?: string | number;
	quantity?: number;
	reference?: string;
	id_category_default?: string | number;
	category_name?: string;
	associations?: {
		images?: Array<{ id: string }>;
		categories?: Array<{ id: string }>;
	};
	coverImage?: string; // New field from catalog

}

export interface Category {
	id: string;
	name?: Array<{ value: string }>;
}

export interface Store {
	id_store: string;
	name: string;
	district: string;
	address: string;
	phone?: string;
	schedule?: string;
	stock?: number;
	active?: string;
}

export interface ProductStore {
	id_product_store: string;
	id_product: string;
	id_store: string;
	stock: string;
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
					revalidate: 0,
					tags: ['products'],
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
			`${PRESTASHOP_URL}/api/categories?display=full&output_format=JSON&ws_key=${API_KEY}&_t=${timestamp}`,
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

		let url = `${PRESTASHOP_URL}/api/products?display=full&output_format=JSON&ws_key=${API_KEY}&_t=${timestamp}`;

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

			console.log('⚠️ Intentando obtener productos sin filtros específicos...');
			const fallbackUrl = `${PRESTASHOP_URL}/api/products?display=full&output_format=JSON&ws_key=${API_KEY}&limit=${limit}&_t=${timestamp}`;

			const fallbackResponse = await fetch(fallbackUrl, {
				headers: getHeaders(),
				cache: 'no-store',
			});

			if (fallbackResponse.ok) {
				const fallbackData = await fallbackResponse.json();
				let products = fallbackData.products || [];

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

		try {
			console.log('⚠️ Último intento: obteniendo productos aleatorios...');
			const products = await getProducts(limit);

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
export function getProductImageUrl(productId: string | number, imageId: string): string {
	return `${PRESTASHOP_URL}/api/images/products/${productId}/${imageId}?ws_key=${API_KEY}`;
}

// Obtener un producto específico por ID
export async function getProduct(id: string): Promise<Product> {
	try {
		const timestamp = Date.now();
		const response = await fetch(
			`${PRESTASHOP_URL}/api/products/${id}?output_format=JSON&ws_key=${API_KEY}&_t=${timestamp}`,
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

// Obtener nombre del producto (maneja string o array)
export function getProductName(product: Product): string {
	if (!product.name) return 'Producto sin nombre';
	if (typeof product.name === 'string') return product.name;
	return product.name[0]?.value || 'Producto sin nombre';
}

// Obtener descripción del producto (maneja string o array)
export function getProductDescription(product: Product): string {
	if (!product.description) return '';
	if (typeof product.description === 'string') return product.description;
	return product.description[0]?.value || '';
}

// ============================================
// 🆕 NUEVAS FUNCIONES PARA TIENDAS
// ============================================

/**
 * Obtener todas las tiendas físicas
 */
export async function getStores(): Promise<Store[]> {
	try {
		console.log('🔄 Obteniendo tiendas físicas...');
		const timestamp = Date.now();

		const response = await fetch(
			`${PRESTASHOP_URL}/api/store_physicals?display=full&output_format=JSON&ws_key=${API_KEY}&_t=${timestamp}`,
			{
				headers: getHeaders(),
				cache: 'no-store',
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Error al obtener tiendas:', response.status, errorText);
			return [];
		}

		const data = await response.json();
		console.log('✅ Tiendas obtenidas:', data.store_physicals?.length || 0);

		return data.store_physicals || [];
	} catch (error) {
		console.error('💥 Error al obtener tiendas:', error);
		return [];
	}
}

/**
 * Obtener tiendas por distrito
 */
export async function getStoresByDistrict(district: string): Promise<Store[]> {
	try {
		console.log('🔄 Obteniendo tiendas del distrito:', district);
		const timestamp = Date.now();

		const response = await fetch(
			`${PRESTASHOP_URL}/api/store_physicals?display=full&filter[district]=[${encodeURIComponent(district)}]&output_format=JSON&ws_key=${API_KEY}&_t=${timestamp}`,
			{
				headers: getHeaders(),
				cache: 'no-store',
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Error al obtener tiendas por distrito:', response.status, errorText);
			return [];
		}

		const data = await response.json();
		const stores = data.store_physicals || [];

		console.log('✅ Tiendas en', district, ':', stores.length);

		return stores;
	} catch (error) {
		console.error('💥 Error al obtener tiendas por distrito:', error);
		return [];
	}
}

// Exportar constantes para uso en otros lugares
export const PRESTASHOP_CONFIG = {
	URL: PRESTASHOP_URL,
	API_KEY: API_KEY,
};