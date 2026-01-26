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
 * Extracts product name from legacy or new product objects,
 * appending variation attributes if present (e.g. "GORRO - Rojo")
 */
export function getProductName(product: any): string {
    if (!product) return '';

    let baseName = '';
    if (typeof product.name === 'string') {
        baseName = product.name;
    } else if (Array.isArray(product.name) && product.name.length > 0) {
        baseName = product.name[0].value || '';
    }

    // Append variation attributes if present
    if (product.variationAttributes && Array.isArray(product.variationAttributes) && product.variationAttributes.length > 0) {
        const attributes = product.variationAttributes
            .map((attr: any) => attr.value)
            .filter(Boolean)
            .join(', ');
        
        if (attributes) {
            return `${baseName} - ${attributes}`;
        }
    }

    return baseName;
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

/**
 * Get the sale/discount price for a product (precio en oferta)
 * 
 * PRICING LOGIC:
 * - For SIMPLE products: returns `price` (this is the sale/offer price after discount)
 * - For VARIABLE products: returns `defaultVariation.price` (this is the sale/offer price)
 * 
 * @param product - Product object from catalog
 * @returns The sale price if available, null otherwise
 */
export function getSalePrice(product: any): number | null {
    if (!product) return null;
    
    // 1. Variable product with defaultVariation
    // For variable products: defaultVariation.price = sale/offer price
    if (product.defaultVariation && product.defaultVariation.price !== undefined && product.defaultVariation.price !== null) {
        return Number(product.defaultVariation.price);
    }
    
    // 2. Simple product with discount
    // For simple products: price = final price after discount, discountPrice = amount discounted
    if (product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice > 0) {
        return Number(product.price); // Return the discounted price (final price)
    }
    
    return null;
}

/**
 * Get the regular (original) price for a product (precio regular)
 * 
 * PRICING LOGIC:
 * - For SIMPLE products: returns `price + discountPrice` (original price before discount)
 * - For VARIABLE products: returns `defaultVariation.priceImpact` if available (this is the regular price)
 *   If priceImpact is not available, falls back to `defaultVariation.price`
 * 
 * @param product - Product object from catalog
 * @returns The regular price
 */
export function getRegularPrice(product: any): number {
    if (!product) return 0;
    
    // 1. Variable product logic
    if (product.defaultVariation) {
        // For variable products: priceImpact = regular price (if available)
        if (product.defaultVariation.priceImpact && Number(product.defaultVariation.priceImpact) > 0) {
            return Number(product.defaultVariation.priceImpact);
        }
        // Fallback to variation price if no priceImpact (no discount scenario)
        return Number(product.defaultVariation.price) || 0;
    }
    
    // 2. Simple product: original price = current price + discount amount
    if (product.discountPrice && Number(product.discountPrice) > 0) {
        return Number(product.price) + Number(product.discountPrice);
    }
    
    // No discount: return current price
    return Number(product.price) || 0;
}

/**
 * Check if a product has a discount/sale price
 * 
 * A product has a discount when:
 * - SIMPLE product: discountPrice (discount amount) exists and is greater than 0
 * - VARIABLE product: defaultVariation.price exists and is less than priceImpact
 * 
 * @param product - Product object from catalog
 * @returns true if the product has a discount, false otherwise
 */
export function hasDiscount(product: any): boolean {
    const salePrice = getSalePrice(product);
    const regularPrice = getRegularPrice(product);
    
    return salePrice !== null && salePrice > 0 && salePrice < regularPrice;
}

/**
 * Get the effective price to display (the price the customer will pay)
 * 
 * Returns the sale price if available, otherwise returns the regular price.
 * This is the main price that should be displayed to the customer.
 * 
 * @param product - Product object from catalog
 * @returns The effective price (sale price if available, otherwise regular price)
 */
export function getEffectivePrice(product: any): number {
    const salePrice = getSalePrice(product);
    if (salePrice !== null && salePrice > 0) {
        // For variable products, if we have priceImpact, salePrice is what we want.
        // For simple products, if we have discountPrice, salePrice is what we want.
        return salePrice;
    }
    return getRegularPrice(product);
}

