import express from 'express';

import type { ExpressRequest, ExpressResponse } from '@/api';
import { verifyRequest } from '@/api/cookies';
import { getProduct } from '@/database/products';
import { addReview } from '@/database/products/reviews';
import type { ProductsId } from '@/schemas/public/Products';

const productReviewsRouter = express.Router();

productReviewsRouter.post(
    '/add',
    async (
        req: ExpressRequest<'/products/review/add'>,
        res: ExpressResponse<'/products/review/add', 'post'>,
    ) => {
        const { body } = req;

        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const { rating: bodyRating, product_id: bodyProductId, comment } = body;
        const productId = bodyProductId as number | undefined | unknown;
        const rating = bodyRating as number | undefined | unknown;

        if (
            !rating ||
            !productId ||
            typeof rating !== 'number' ||
            typeof productId !== 'number'
        ) {
            res.status(400).json({
                success: false,
                error: 'Invalid request',
            });
            return;
        }

        if (typeof comment === 'undefined' || comment === null) {
            res.status(400).json({
                success: false,
                error: 'Invalid comment',
            });
            return;
        }

        // check if rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            res.status(400).json({
                success: false,
                error: 'Invalid rating',
            });
            return;
        }

        // check if product exists
        const product = await getProduct(productId as ProductsId);

        if (!product) {
            res.status(400).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }

        const success = await addReview(
            productId as ProductsId,
            user.id,
            rating,
            comment,
        );

        if (success) {
            res.json({ success: true, data: null });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    },
);

export default productReviewsRouter;
