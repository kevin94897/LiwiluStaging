/**
 * Common utilities previously in lib/prestashop.ts
 */

/**
 * Formats a numeric or string price into a currency format (e.g., S/ 1,234.56)
 */
export function formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'S/ 0.00';

    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
    }).format(numPrice).replace('PEN', 'S/');
}

/**
 * Extracts product name from legacy or new product objects
 */
export function getProductName(product: any): string {
    if (!product) return '';

    if (typeof product.name === 'string') {
        return product.name;
    }

    if (Array.isArray(product.name) && product.name.length > 0) {
        return product.name[0].value || '';
    }

    return '';
}

/**
 * Extracts product description from legacy or new product objects
 */
export function getProductDescription(product: any): string {
    if (!product) return '';

    if (typeof product.description === 'string') {
        return product.description;
    }

    if (Array.isArray(product.description) && product.description.length > 0) {
        return product.description[0].value || '';
    }

    return '';
}

/**
 * Legacy image URL generator for PrestaShop images
 * (Kept for compatibility if some old images are still referenced)
 */
export function getProductImageUrl(productId: string, imageId: string): string {
    const PRESTASHOP_URL = 'https://liwilu.com'; // Adjust to actual PrestaShop URL if different
    const API_KEY = 'YOUR_API_KEY'; // This is problematic without the original file, but most new code uses coverImage
    return `${PRESTASHOP_URL}/api/images/products/${productId}/${imageId}`;
}
