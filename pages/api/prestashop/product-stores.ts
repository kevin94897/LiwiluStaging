// pages/api/prestashop/product-stores.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getStoresForMultipleProducts } from '@/lib/prestashop';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { product_ids } = req.body;

	if (!product_ids || !Array.isArray(product_ids)) {
		return res.status(400).json({ 
			error: 'product_ids is required and must be an array' 
		});
	}

	try {
		console.log('📦 Buscando tiendas para productos:', product_ids);

		// Usar la función de la librería
		const productStores = await getStoresForMultipleProducts(product_ids);

		console.log('✅ Tiendas obtenidas exitosamente');
		return res.status(200).json(productStores);

	} catch (error) {
		console.error('❌ Error en API product-stores:', error);
		return res.status(500).json({ 
			error: 'Error al obtener tiendas',
			details: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}