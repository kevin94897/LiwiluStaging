import { authenticatedFetch } from './auth/apiClient';

/**
 * Legacy Product interface for compatibility
 */
export interface Product {
    id: string | number;
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
    coverImage?: string;
    originalPrice?: string | number;
    productId?: string | number;
}

/**
 * Legacy Category interface for compatibility
 */
export interface Category {
    id: string | number;
    name: Array<{ value: string }> | string;
    link_rewrite?: Array<{ value: string }> | string;
    id_parent?: string | number;
    level_depth?: string | number;
    active?: string;
}

export interface CatalogProduct {
    id: number;
    prestashopId: number;
    reference: string;
    name: string;
    linkRewrite: string;
    categoryId: number;
    nameCategory: string;
    brandId: number;
    nameBrand: string;
    price: number;
    priceWithTax: number;
    discountPrice: number | null;
    discountPercent: number;
    quantity: number;
    condition: string;
    coverImage: string;
}

export interface CatalogResponse {
    success: boolean;
    data: CatalogProduct[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
    filters: {
        applied: {
            categories: number[];
            brands: number[];
            sortBy: string;
            sortOrder: string;
        };
    };
}

export interface FilterParams {
    page?: number;
    limit?: number;
    categoryIds?: number[];
    brandIds?: number[];
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    minPrice?: number;
    maxPrice?: number;
    search?: string;
}

/**
 * Fetch products from the catalog endpoint.
 * This can be used both client-side and server-side (if using fetch polyfill or node env, but authenticatedFetch is client-side).
 * For Server-Side Props, we should use a direct fetch if authentication is not required or handled differently.
 */
export async function searchProducts(params: FilterParams = {}): Promise<CatalogResponse> {

    // Construct query string
    const queryParts: string[] = [];

    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.categoryIds && params.categoryIds.length > 0) queryParts.push(`categoryIds=${params.categoryIds.join(',')}`);
    if (params.brandIds && params.brandIds.length > 0) queryParts.push(`brandIds=${params.brandIds.join(',')}`);
    if (params.inStock !== undefined) queryParts.push(`inStock=${params.inStock}`);
    if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
    if (params.sortOrder) queryParts.push(`sortOrder=${params.sortOrder}`);

    // Ensure we have a base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const url = `${baseUrl}/catalog/products/search${queryString}`;

    console.log('Fetching products from:', url);

    try {
        // Try to fetch without auth first (public catalog)
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching products: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in searchProducts:', error);
        // Return empty structure on error to prevent crashes
        return {
            success: false,
            data: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false },
            filters: { applied: { categories: [], brands: [], sortBy: 'price', sortOrder: 'asc' } }
        };
    }
}

export interface FeaturedProductsResponse {
    success: boolean;
    total: number;
    data: CatalogProduct[];
}

/**
 * Fetch featured products from the catalog endpoint.
 */
export async function getFeaturedProducts(): Promise<CatalogProduct[]> {

    // Ensure we have a base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}/catalog/products/featured`;

    console.log('Fetching featured products from:', url);

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching featured products: ${response.statusText}`);
        }

        const data: FeaturedProductsResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error in getFeaturedProducts:', error);
        return [];
    }
}


export interface HierarchyParentGroup {
    nameParent: string;
    name: string;
    linkRewrite: string;
    levelDepth: number;
    type: string;
}

export interface HierarchyItem {
    id: number;
    nameParent: string;
    name: string;
    linkRewrite: string;
    levelDepth: number;
    parentId?: number | null;
    type: 'category' | 'brand' | 'attribute';
    attributeType?: string;
}

export interface HierarchyResponse {
    success: boolean;
    hierarchy: {
        parentGroups: HierarchyParentGroup[];
        items: HierarchyItem[];
    };
    summary: any;
}

export interface CategoryLevelTwo {
    id: number;
    prestashopId: number;
    name: string;
    description: string;
    linkRewrite: string;
    parentId: number | null;
    levelDepth: number;
    position: number;
    coverImage: string | null;
    active: boolean;
}

export interface LevelTwoCategoriesResponse {
    success: boolean;
    total: number;
    data: CategoryLevelTwo[];
}

/**
 * Fetch catalog hierarchy (filters structure).
 */
export async function getCatalogHierarchy(): Promise<HierarchyResponse | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}/catalog/hierarchy`;

    console.log('Fetching hierarchy from:', url);

    try {
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error(`Error fetching hierarchy: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error in getCatalogHierarchy:', error);
        return null;
    }
}

/**
 * Favorites Interface
 */
export interface FavoriteProduct {
    id: number;
    prestashopId: number;
    reference: string;
    name: string;
    linkRewrite: string;
    defaultCategory: {
        id: number;
        name: string;
        linkRewrite: string;
    };
    price: number;
    priceWithTax: number;
    discountPrice: number | null;
    discountPercent: number;
    quantity: number;
    condition: string;
    coverImage: string;
    gallery: {
        id: number;
        url: string;
        position: number;
    }[];
    addedToFavoritesAt: string;
}

export interface FavoritesResponse {
    success: boolean;
    total: number;
    data: FavoriteProduct[];
}

/**
 * Fetch user favorites
 */
export async function getFavorites(): Promise<FavoritesResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await authenticatedFetch(`${baseUrl}/catalog/products/favorites`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Error fetching favorites');
    }

    return await response.json();
}

/**
 * Toggle favorite status for a product
 */
export async function toggleFavorite(productId: number): Promise<{
    action: 'added' | 'removed';
    productId: number;
    isFavorite: boolean;
    favoriteId?: string;
}> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await authenticatedFetch(`${baseUrl}/favorites/toggle/${productId}`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Toggle favorite error:', response.status, errorText);
        throw new Error(`Error toggling favorite (${response.status}): ${errorText}`);
    }

    return await response.json();
}

/**
 * Check favorite status for multiple products
 */
export async function checkMultipleFavorites(productIds: number[]): Promise<Record<string, boolean>> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await authenticatedFetch(`${baseUrl}/favorites/check-multiple`, {
        method: 'POST',
        body: JSON.stringify({ productIds }),
    });

    if (!response.ok) {
        return {};
    }

    return await response.json();
}

/**
 * Get count of favorite products
 */
export async function getFavoritesCount(): Promise<{ count: number }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await authenticatedFetch(`${baseUrl}/favorites/count`, {
        method: 'GET',
    });

    if (!response.ok) {
        return { count: 0 };
    }

    return await response.json();
}

export interface ProductBasicData {
    id: number;
    name: string;
    condition: string;
    sku: string;
    description: string;
    resume: string;
    metaTitle: string;
    metaDescription: string;
    linkRewrite: string;
    defaultCategory: {
        name: string;
        linkRewrite: string;
        active: boolean;
        levelDepth: number;
    };
    features: {
        name: string;
        value: string;
    }[];
}

export interface ProductBasicResponse {
    success: boolean;
    data: ProductBasicData;
}



export interface ProductPrice {
    amount: number;
    amountWithTax: number;
    currency: string;
    taxRate: number;
    formattedPrice: string;
    formattedPriceWithTax: string;
    priceImpact?: number;
    priceImpactType?: string;
    discount?: any;
}

export interface ProductStock {
    quantity: number;
    inStock: boolean;
    availableForOrder: boolean;
    lowStockThreshold?: number;
    isLowStock?: boolean;
    availableDate?: string | null;
}

export interface ProductImage {
    id?: number;
    url: string;
    alt: string;
    width?: number;
    height?: number;
    position?: number;
    isCover?: boolean;
}

export interface ProductMedia {
    coverImage: ProductImage;
    gallery: ProductImage[];
}

export interface ProductAttributeValue {
    id: number;
    prestashopId?: number;
    value: string;
    slug: string;
    colorHex?: string | null;
    texture?: string | null;
    available?: boolean;
    position?: number;
}

export interface ProductAttribute {
    id: number;
    type: string; // 'color' | 'talla' etc.
    name: string;
    displayType?: string; // 'swatch' | 'button'
    required?: boolean;
    position?: number;
    values?: ProductAttributeValue[]; // Present in the main attributes list
    value?: string; // Present in specific variation attributes
    slug?: string;
    colorHex?: string;
}

export interface ProductVariation {
    id: number;
    prestashopCombinationId: number;
    sku: string;
    reference: string;
    price: ProductPrice;
    stock: ProductStock;
    attributes: ProductAttribute[];
    images: ProductImage[];
    shipping?: any;
    isDefault: boolean;
    isActive: boolean;
    availableDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProductVariationsData {
    productId: number;
    prestashopProductId: number;
    base: {
        price: ProductPrice;
        stock: ProductStock;
    };
    media: ProductMedia;
    attributes: ProductAttribute[];
    variations: ProductVariation[];
    availabilityMatrix: Record<string, boolean>;
    metadata: {
        totalVariations: number;
        activeVariations: number;
        hasStock: boolean;
        priceRange: {
            min: number;
            max: number;
            currency: string;
            formattedMin: string;
            formattedMax: string;
        };
        totalImages: number;
        lastUpdated: string;
    };
}

export interface ProductVariationsResponse {
    success: boolean;
    data: ProductVariationsData;
}

/**
 * Fetch basic product information.
 */
export async function getProductBasic(productId: string | number): Promise<ProductBasicData | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}/catalog/products/${productId}/basic`;
    console.log('Fetching product basic from:', url);
    try {
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) {
            console.error(`Error fetching product basic: ${response.status} ${response.statusText} URL: ${url}`);
            throw new Error(`Error fetching product basic: ${response.statusText}`);
        }
        const data: ProductBasicResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error in getProductBasic:', error);
        return null;
    }
}

/**
 * Fetch product variations.
 * TODO: Remove mock when backend is ready.
 */
export async function getProductVariations(productId: string | number): Promise<ProductVariationsData | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}/catalog/products/${productId}/variations`;
    console.log('Fetching product variations from:', url);
    try {
        // MOCK RESPONSE FOR DEVELOPMENT
        // TODO: Uncomment the actual fetch when backend is ready
        // /*
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) {
            console.error(`Error fetching product variations: ${response.status} ${response.statusText} URL: ${url}`);
            throw new Error(`Error fetching product variations: ${response.statusText}`);
        }
        const data: ProductVariationsResponse = await response.json();
        return data.data;
        // */

        // Return mock data matching the user request
        // return {
        //     "productId": 1,
        //     "prestashopProductId": 20,
        //     "base": {
        //         "price": {
        //             "amount": 26,
        //             "amountWithTax": 26,
        //             "currency": "PEN",
        //             "taxRate": 0,
        //             "formattedPrice": "S/ 26.00",
        //             "formattedPriceWithTax": "S/ 26.00"
        //         },
        //         "stock": {
        //             "quantity": 599993,
        //             "inStock": true,
        //             "availableForOrder": true
        //         }
        //     },
        //     "media": {
        //         "coverImage": {
        //             "url": "https://prestashopliwilu.nerdstudiolab.com/26/producto-prueba.jpg",
        //             "alt": "Producto Flores",
        //             "width": 800,
        //             "height": 800
        //         },
        //         "gallery": [
        //             {
        //                 "id": 24,
        //                 "url": "https://prestashopliwilu.nerdstudiolab.com/24/producto-prueba.jpg",
        //                 "alt": "Producto Flores - Vista 1",
        //                 "position": 1,
        //                 "width": 800,
        //                 "height": 800
        //             },
        //             {
        //                 "id": 26,
        //                 "url": "https://prestashopliwilu.nerdstudiolab.com/26/producto-prueba.jpg",
        //                 "alt": "Producto Flores - Vista 2",
        //                 "position": 2,
        //                 "width": 800,
        //                 "height": 800
        //             },
        //             {
        //                 "id": 27,
        //                 "url": "https://prestashopliwilu.nerdstudiolab.com/27/producto-prueba.jpg",
        //                 "alt": "Producto Flores - Vista 3",
        //                 "position": 3,
        //                 "width": 800,
        //                 "height": 800
        //             },
        //             {
        //                 "id": 28,
        //                 "url": "https://prestashopliwilu.nerdstudiolab.com/28/producto-prueba.jpg",
        //                 "alt": "Producto Flores - Vista 4",
        //                 "position": 4,
        //                 "width": 800,
        //                 "height": 800
        //             }
        //         ]
        //     },
        //     "attributes": [
        //         {
        //             "id": 1,
        //             "type": "color",
        //             "name": "Color",
        //             "displayType": "swatch",
        //             "required": true,
        //             "position": 1,
        //             "values": [
        //                 {
        //                     "id": 3,
        //                     "prestashopId": 28,
        //                     "value": "Amarillo",
        //                     "slug": "amarillo",
        //                     "colorHex": "#ffe61f",
        //                     "texture": null,
        //                     "available": true,
        //                     "position": 1
        //                 },
        //                 {
        //                     "id": 2,
        //                     "prestashopId": 27,
        //                     "value": "Verde",
        //                     "slug": "verde",
        //                     "colorHex": "#419700",
        //                     "texture": null,
        //                     "available": true,
        //                     "position": 2
        //                 },
        //                 {
        //                     "id": 4,
        //                     "prestashopId": 29,
        //                     "value": "Azul",
        //                     "slug": "azul",
        //                     "colorHex": "#072cff",
        //                     "texture": null,
        //                     "available": false,
        //                     "position": 3
        //                 }
        //             ]
        //         },
        //         {
        //             "id": 2,
        //             "type": "talla",
        //             "name": "Tallas",
        //             "displayType": "button",
        //             "required": true,
        //             "position": 2,
        //             "values": [
        //                 {
        //                     "id": 5,
        //                     "prestashopId": 30,
        //                     "value": "M",
        //                     "slug": "m",
        //                     "colorHex": null,
        //                     "texture": null,
        //                     "available": true,
        //                     "position": 1
        //                 },
        //                 {
        //                     "id": 6,
        //                     "prestashopId": 31,
        //                     "value": "S",
        //                     "slug": "s",
        //                     "colorHex": null,
        //                     "texture": null,
        //                     "available": true,
        //                     "position": 2
        //                 },
        //                 {
        //                     "id": 7,
        //                     "prestashopId": 32,
        //                     "value": "L",
        //                     "slug": "l",
        //                     "colorHex": null,
        //                     "texture": null,
        //                     "available": true,
        //                     "position": 3
        //                 },
        //                 {
        //                     "id": 8,
        //                     "prestashopId": 33,
        //                     "value": "XL",
        //                     "slug": "xl",
        //                     "colorHex": null,
        //                     "texture": null,
        //                     "available": true,
        //                     "position": 4
        //                 }
        //             ]
        //         }
        //     ],
        //     "variations": [
        //         {
        //             "id": 17,
        //             "prestashopCombinationId": 44,
        //             "sku": "SKU-20-17",
        //             "reference": "",
        //             "price": {
        //                 "amount": 26,
        //                 "amountWithTax": 26,
        //                 "currency": "PEN",
        //                 "priceImpact": 4,
        //                 "priceImpactType": "fixed",
        //                 "taxRate": 0,
        //                 "formattedPrice": "S/ 26.00",
        //                 "formattedPriceWithTax": "S/ 26.00",
        //                 "discount": null
        //             },
        //             "stock": {
        //                 "quantity": 99999,
        //                 "inStock": true,
        //                 "availableForOrder": true,
        //                 "lowStockThreshold": 10,
        //                 "isLowStock": false,
        //                 "availableDate": null
        //             },
        //             "attributes": [
        //                 {
        //                     "id": 3,
        //                     "type": "color",
        //                     "name": "Color",
        //                     "value": "Amarillo",
        //                     "slug": "amarillo",
        //                     "colorHex": "#ffe61f"
        //                 }
        //             ],
        //             "images": [
        //                 {
        //                     "id": 1701,
        //                     "url": "https://prestashopliwilu.nerdstudiolab.com/26/producto-prueba.jpg",
        //                     "alt": "Producto Flores - Amarillo - Vista 1",
        //                     "position": 1,
        //                     "isCover": true,
        //                     "width": 800,
        //                     "height": 800
        //                 },
        //                 {
        //                     "id": 1702,
        //                     "url": "https://prestashopliwilu.nerdstudiolab.com/27/producto-prueba.jpg",
        //                     "alt": "Producto Flores - Amarillo - Vista 2",
        //                     "position": 2,
        //                     "isCover": false,
        //                     "width": 800,
        //                     "height": 800
        //                 },
        //                 {
        //                     "id": 1703,
        //                     "url": "https://prestashopliwilu.nerdstudiolab.com/28/producto-prueba.jpg",
        //                     "alt": "Producto Flores - Amarillo - Vista 3",
        //                     "position": 3,
        //                     "isCover": false,
        //                     "width": 800,
        //                     "height": 800
        //                 }
        //             ],
        //             "shipping": {
        //                 "weight": 0,
        //                 "width": 0,
        //                 "height": 0,
        //                 "depth": 0,
        //                 "unit": "cm"
        //             },
        //             "isDefault": true,
        //             "isActive": true,
        //             "availableDate": null,
        //             "createdAt": "2025-12-16T01:20:59.147Z",
        //             "updatedAt": "2025-12-30T13:47:48.528Z"
        //         },
        //         {
        //             "id": 16,
        //             "prestashopCombinationId": 43,
        //             "sku": "SKU-20-16",
        //             "reference": "",
        //             "price": {
        //                 "amount": 25,
        //                 "amountWithTax": 25,
        //                 "currency": "PEN",
        //                 "priceImpact": 3,
        //                 "priceImpactType": "fixed",
        //                 "taxRate": 0,
        //                 "formattedPrice": "S/ 25.00",
        //                 "formattedPriceWithTax": "S/ 25.00",
        //                 "discount": null
        //             },
        //             "stock": {
        //                 "quantity": 99998,
        //                 "inStock": true,
        //                 "availableForOrder": true,
        //                 "lowStockThreshold": 10,
        //                 "isLowStock": false,
        //                 "availableDate": null
        //             },
        //             "attributes": [
        //                 {
        //                     "id": 2,
        //                     "type": "color",
        //                     "name": "Color",
        //                     "value": "Verde",
        //                     "slug": "verde",
        //                     "colorHex": "#419700"
        //                 }
        //             ],
        //             "images": [
        //                 {
        //                     "id": 1601,
        //                     "url": "https://prestashopliwilu.nerdstudiolab.com/27/producto-prueba.jpg",
        //                     "alt": "Producto Flores - Verde - Vista 1",
        //                     "position": 1,
        //                     "isCover": true,
        //                     "width": 800,
        //                     "height": 800
        //                 }
        //             ],
        //             "shipping": {
        //                 "weight": 0,
        //                 "width": 0,
        //                 "height": 0,
        //                 "depth": 0,
        //                 "unit": "cm"
        //             },
        //             "isDefault": false,
        //             "isActive": true,
        //             "availableDate": null,
        //             "createdAt": "2025-12-16T01:20:59.129Z",
        //             "updatedAt": "2025-12-30T13:47:48.501Z"
        //         },
        //         {
        //             "id": 102,
        //             "prestashopCombinationId": 47,
        //             "sku": "SKU-20-102",
        //             "reference": "",
        //             "price": {
        //                 "amount": 22,
        //                 "amountWithTax": 22,
        //                 "currency": "PEN",
        //                 "priceImpact": 0,
        //                 "priceImpactType": "fixed",
        //                 "taxRate": 0,
        //                 "formattedPrice": "S/ 22.00",
        //                 "formattedPriceWithTax": "S/ 22.00",
        //                 "discount": null
        //             },
        //             "stock": {
        //                 "quantity": 99999,
        //                 "inStock": true,
        //                 "availableForOrder": true,
        //                 "lowStockThreshold": 10,
        //                 "isLowStock": false,
        //                 "availableDate": null
        //             },
        //             "attributes": [
        //                 {
        //                     "id": 5,
        //                     "type": "talla",
        //                     "name": "Tallas",
        //                     "value": "M",
        //                     "slug": "m"
        //                 }
        //             ],
        //             "images": [],
        //             "shipping": {
        //                 "weight": 0,
        //                 "width": 0,
        //                 "height": 0,
        //                 "depth": 0,
        //                 "unit": "cm"
        //             },
        //             "isDefault": false,
        //             "isActive": true,
        //             "availableDate": null,
        //             "createdAt": "2025-12-30T12:58:12.550Z",
        //             "updatedAt": "2025-12-30T13:47:48.543Z"
        //         },
        //         {
        //             "id": 103,
        //             "prestashopCombinationId": 48,
        //             "sku": "SKU-20-103",
        //             "reference": "",
        //             "price": {
        //                 "amount": 24,
        //                 "amountWithTax": 24,
        //                 "currency": "PEN",
        //                 "priceImpact": 2,
        //                 "priceImpactType": "fixed",
        //                 "taxRate": 0,
        //                 "formattedPrice": "S/ 24.00",
        //                 "formattedPriceWithTax": "S/ 24.00",
        //                 "discount": null
        //             },
        //             "stock": {
        //                 "quantity": 99999,
        //                 "inStock": true,
        //                 "availableForOrder": true,
        //                 "lowStockThreshold": 10,
        //                 "isLowStock": false,
        //                 "availableDate": null
        //             },
        //             "attributes": [
        //                 {
        //                     "id": 6,
        //                     "type": "talla",
        //                     "name": "Tallas",
        //                     "value": "S",
        //                     "slug": "s"
        //                 }
        //             ],
        //             "images": [],
        //             "shipping": {
        //                 "weight": 0,
        //                 "width": 0,
        //                 "height": 0,
        //                 "depth": 0,
        //                 "unit": "cm"
        //             },
        //             "isDefault": false,
        //             "isActive": true,
        //             "availableDate": null,
        //             "createdAt": "2025-12-30T12:58:12.586Z",
        //             "updatedAt": "2025-12-30T13:47:48.558Z"
        //         },
        //         {
        //             "id": 104,
        //             "prestashopCombinationId": 49,
        //             "sku": "SKU-20-104",
        //             "reference": "",
        //             "price": {
        //                 "amount": 37,
        //                 "amountWithTax": 37,
        //                 "currency": "PEN",
        //                 "priceImpact": 15,
        //                 "priceImpactType": "fixed",
        //                 "taxRate": 0,
        //                 "formattedPrice": "S/ 37.00",
        //                 "formattedPriceWithTax": "S/ 37.00",
        //                 "discount": null
        //             },
        //             "stock": {
        //                 "quantity": 99999,
        //                 "inStock": true,
        //                 "availableForOrder": true,
        //                 "lowStockThreshold": 10,
        //                 "isLowStock": false,
        //                 "availableDate": null
        //             },
        //             "attributes": [
        //                 {
        //                     "id": 7,
        //                     "type": "talla",
        //                     "name": "Tallas",
        //                     "value": "L",
        //                     "slug": "l"
        //                 }
        //             ],
        //             "images": [],
        //             "shipping": {
        //                 "weight": 0,
        //                 "width": 0,
        //                 "height": 0,
        //                 "depth": 0,
        //                 "unit": "cm"
        //             },
        //             "isDefault": false,
        //             "isActive": true,
        //             "availableDate": null,
        //             "createdAt": "2025-12-30T12:58:12.605Z",
        //             "updatedAt": "2025-12-30T13:47:48.573Z"
        //         },
        //         {
        //             "id": 135,
        //             "prestashopCombinationId": 50,
        //             "sku": "SKU-20-135",
        //             "reference": "",
        //             "price": {
        //                 "amount": 42,
        //                 "amountWithTax": 42,
        //                 "currency": "PEN",
        //                 "priceImpact": 20,
        //                 "priceImpactType": "fixed",
        //                 "taxRate": 0,
        //                 "formattedPrice": "S/ 42.00",
        //                 "formattedPriceWithTax": "S/ 42.00",
        //                 "discount": null
        //             },
        //             "stock": {
        //                 "quantity": 99999,
        //                 "inStock": true,
        //                 "availableForOrder": true,
        //                 "lowStockThreshold": 10,
        //                 "isLowStock": false,
        //                 "availableDate": null
        //             },
        //             "attributes": [
        //                 {
        //                     "id": 3,
        //                     "type": "color",
        //                     "name": "Color",
        //                     "value": "Amarillo",
        //                     "slug": "amarillo",
        //                     "colorHex": "#ffe61f"
        //                 },
        //                 {
        //                     "id": 8,
        //                     "type": "talla",
        //                     "name": "Tallas",
        //                     "value": "XL",
        //                     "slug": "xl"
        //                 }
        //             ],
        //             "images": [],
        //             "shipping": {
        //                 "weight": 0,
        //                 "width": 0,
        //                 "height": 0,
        //                 "depth": 0,
        //                 "unit": "cm"
        //             },
        //             "isDefault": false,
        //             "isActive": true,
        //             "availableDate": null,
        //             "createdAt": "2025-12-30T13:46:24.416Z",
        //             "updatedAt": "2025-12-30T13:47:48.587Z"
        //         },
        //         {
        //             "id": 136,
        //             "prestashopCombinationId": 51,
        //             "sku": "SKU-20-136",
        //             "reference": "",
        //             "price": {
        //                 "amount": 42,
        //                 "amountWithTax": 42,
        //                 "currency": "PEN",
        //                 "priceImpact": 20,
        //                 "priceImpactType": "fixed",
        //                 "taxRate": 0,
        //                 "formattedPrice": "S/ 42.00",
        //                 "formattedPriceWithTax": "S/ 42.00",
        //                 "discount": null
        //             },
        //             "stock": {
        //                 "quantity": 0,
        //                 "inStock": false,
        //                 "availableForOrder": true,
        //                 "lowStockThreshold": 10,
        //                 "isLowStock": false,
        //                 "availableDate": null
        //             },
        //             "attributes": [
        //                 {
        //                     "id": 4,
        //                     "type": "color",
        //                     "name": "Color",
        //                     "value": "Azul",
        //                     "slug": "azul",
        //                     "colorHex": "#072cff"
        //                 },
        //                 {
        //                     "id": 8,
        //                     "type": "talla",
        //                     "name": "Tallas",
        //                     "value": "XL",
        //                     "slug": "xl"
        //                 }
        //             ],
        //             "images": [],
        //             "shipping": {
        //                 "weight": 0,
        //                 "width": 0,
        //                 "height": 0,
        //                 "depth": 0,
        //                 "unit": "cm"
        //             },
        //             "isDefault": false,
        //             "isActive": true,
        //             "availableDate": null,
        //             "createdAt": "2025-12-30T13:46:24.435Z",
        //             "updatedAt": "2025-12-30T13:47:48.608Z"
        //         }
        //     ],
        //     "availabilityMatrix": {
        //         "amarillo_m": false,
        //         "amarillo_s": false,
        //         "amarillo_l": false,
        //         "amarillo_xl": true,
        //         "verde_m": false,
        //         "verde_s": false,
        //         "verde_l": false,
        //         "verde_xl": false,
        //         "azul_m": false,
        //         "azul_s": false,
        //         "azul_l": false,
        //         "azul_xl": false
        //     },
        //     "metadata": {
        //         "totalVariations": 7,
        //         "activeVariations": 7,
        //         "hasStock": true,
        //         "priceRange": {
        //             "min": 22,
        //             "max": 42,
        //             "currency": "PEN",
        //             "formattedMin": "S/ 22.00",
        //             "formattedMax": "S/ 42.00"
        //         },
        //         "totalImages": 8,
        //         "lastUpdated": "2025-12-30T13:47:48.490Z"
        //     }
        // };
    } catch (error) {
        console.error('Error in getProductVariations:', error);
        return null;
    }
}

/**
 * Fetch level two categories (main categories for buttons).
 */
export async function getLevelTwoCategories(): Promise<CategoryLevelTwo[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}/catalog/categories/level-two`;

    console.log('Fetching level two categories from:', url);

    try {
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error(`Error fetching level two categories: ${response.statusText}`);
        const data: LevelTwoCategoriesResponse = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error in getLevelTwoCategories:', error);
        return [];
    }
}

/**
 * Legacy getCategories for compatibility
 */
export async function getCategories(): Promise<Category[]> {
    const categories = await getLevelTwoCategories();
    return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        link_rewrite: cat.linkRewrite,
        id_parent: cat.parentId || 0,
        level_depth: cat.levelDepth,
        active: cat.active ? '1' : '0'
    }));
}

/**
 * Legacy getRelatedProducts for compatibility
 */
export async function getRelatedProducts(
    categoryId?: string | null,
    excludeProductId?: string | null,
    limit: number = 8
): Promise<Product[]> {
    try {
        const params: FilterParams = {
            limit,
            categoryIds: categoryId ? [parseInt(categoryId)] : undefined
        };

        const response = await searchProducts(params);

        // Filter out the current product and map to legacy Product interface
        return (response.data || [])
            .filter(p => p && p.id && p.id.toString() !== excludeProductId && p.prestashopId?.toString() !== excludeProductId)
            .map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                quantity: p.quantity,
                reference: p.reference,
                coverImage: p.coverImage,
                associations: {
                    categories: [{ id: p.categoryId?.toString() || '0' }]
                }
            }));
    } catch (error) {
        console.error('Error in getRelatedProducts fallback:', error);
        return [];
    }
}
