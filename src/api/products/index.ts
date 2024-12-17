import type { ExpressResponse } from 'api';
import { getProduct, listProducts, searchProducts } from 'database/products';
import express from 'express';

import { verifyRequest } from '@/api/cookies';
import productReviewsRouter from '@/api/products/reviews';
import { getReviews } from '@/database/products/reviews';
import type { ProductsId } from '@/schemas/public/Products';

const productsRouter = express.Router();

productsRouter.get(
    '/list',
    async (_req, res: ExpressResponse<'/products/list', 'get'>) => {
        const products = await listProducts();

        res.json({ success: true, data: products });
    },
);

productsRouter.get(
    '/search',
    async (req, res: ExpressResponse<'/products/search', 'get'>) => {
        const searchQuery = req.query.query;

        if (!searchQuery) {
            res.status(400).json({
                success: false,
                error: 'No search query provided',
            });
            return;
        }

        const dbProducts = await listProducts();

        const products = await searchProducts(
            searchQuery.toString(),
            dbProducts,
        );

        res.json({ success: true, data: products });
    },
);

productsRouter.get(
    '/get',
    async (req, res: ExpressResponse<'/products/get', 'get'>) => {
        const { id } = req.query;

        const user = await verifyRequest(req, res, false);

        if (!id) {
            res.status(400).json({
                success: false,
                error: 'No ID provided',
            });
            return;
        }

        const productId = parseInt(id as string, 10) as ProductsId;

        if (Number.isNaN(productId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID',
            });
            return;
        }

        const product = await getProduct(productId);

        if (!product) {
            res.status(404).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }

        const reviews = await getReviews(productId, user?.id);

        res.json({ success: true, data: { product, reviews } });
    },
);

productsRouter.use('/review', productReviewsRouter);

export default productsRouter;
