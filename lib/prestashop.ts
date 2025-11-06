const PRESTASHOP_URL = 'https://prestaliwilu.nerdstudiolab.com';
const API_KEY = 'UHYQHJRLSVS48ESSFANPDHA1EZ8HATYB';

export interface Product {
  id: string;
  name?: Array<{ value: string }>;
  price?: string;
  quantity?: number;
  reference?: string;
  id_category_default?: string;
  associations?: {
    images?: Array<{ id: string }>;
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
    'Authorization': `Basic ${auth}`,
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
          tags: ['products'] // Para revalidación manual si la necesitas
        }
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
    
    const response = await fetch(
      `${PRESTASHOP_URL}/api/categories?display=full`,
      { 
        headers: getHeaders(),
        cache: 'no-store'
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

// URL de imagen del producto
export function getProductImageUrl(productId: string, imageId: string): string {
  return `${PRESTASHOP_URL}/api/images/products/${productId}/${imageId}?ws_key=${API_KEY}`;
}

// Formatear precio
export function formatPrice(price: string | number, currency: string = 'S/'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${currency} ${numPrice.toFixed(2)}`;
}