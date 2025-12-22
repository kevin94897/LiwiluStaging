import { authenticatedFetch } from './auth/apiClient';

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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://liwilu-backend.nerdstudiolab.com/api'; // Fallback purely for safety

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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://liwilu-backend.nerdstudiolab.com/api'; // Fallback
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://liwilu-backend.nerdstudiolab.com/api';
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://liwilu-backend.nerdstudiolab.com/api';
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://liwilu-backend.nerdstudiolab.com/api';
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://liwilu-backend.nerdstudiolab.com/api';
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://liwilu-backend.nerdstudiolab.com/api';
    const response = await authenticatedFetch(`${baseUrl}/favorites/count`, {
        method: 'GET',
    });

    if (!response.ok) {
        return { count: 0 };
    }

    return await response.json();
}

/**
 * Fetch level two categories (main categories for buttons).
 */
export async function getLevelTwoCategories(): Promise<CategoryLevelTwo[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://liwilu-backend.nerdstudiolab.com/api';
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
