import type { ExpressResponse } from 'api';
import type { SearchedProducts } from 'database/products';
import { listProducts, searchProducts } from 'database/products';
import express from 'express';
import type Products from 'schemas/public/Products';

const productsRouter = express.Router();

productsRouter.get('/list', async (_req, res: ExpressResponse<Products[]>) => {
    const products = await listProducts();
    res.json({ success: true, data: products });
});

productsRouter.get(
    '/search',
    async (req, res: ExpressResponse<SearchedProducts[]>) => {
        const searchQuery = req.query.query;

        if (!searchQuery) {
            res.status(400).json({
                success: false,
                error: 'No search query provided',
            });
            return;
        }

        const products = await searchProducts(searchQuery.toString());

        res.json({ success: true, data: products });
    },
);

productsRouter.get('/get', async (req, res: ExpressResponse<Products>) => {
    const { id } = req.query;

    if (!id) {
        res.status(400).json({
            success: false,
            error: 'No ID provided',
        });
        return;
    }

    const products = await listProducts();

    const product = products.find(p => p.id === parseInt(id as string, 10));

    if (!product) {
        res.status(404).json({
            success: false,
            error: 'Product not found',
        });
        return;
    }

    res.json({ success: true, data: product });
});

export default productsRouter;
