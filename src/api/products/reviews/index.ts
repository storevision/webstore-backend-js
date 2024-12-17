import express from 'express';

import type { ExpressRequest, ExpressResponse } from '@/api';
import { verifyRequest } from '@/api/cookies';
import { getProduct } from '@/database/products';
import {
    addReview,
    deleteReview,
    ReviewAlreadyExistsError,
    updateReview,
} from '@/database/products/reviews';
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

        try {
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
        } catch (error) {
            if (error instanceof ReviewAlreadyExistsError) {
                res.status(409).json({
                    success: false,
                    error: 'Review already exists',
                });
            } else {
                console.error('Error adding review:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                });
            }
        }
    },
);

productReviewsRouter.post(
    '/delete',
    async (
        req: ExpressRequest<'/products/review/delete'>,
        res: ExpressResponse<'/products/review/delete', 'post'>,
    ) => {
        const { body } = req;

        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const { product_id: bodyProductId } = body;
        const productId = bodyProductId as number | undefined | unknown;

        if (!productId || typeof productId !== 'number') {
            res.status(400).json({
                success: false,
                error: 'Invalid request',
            });
            return;
        }

        try {
            const success = await deleteReview(
                productId as ProductsId,
                user.id,
            );

            if (success) {
                res.json({ success: true, data: null });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                });
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    },
);

productReviewsRouter.post(
    '/edit',
    async (
        req: ExpressRequest<'/products/review/edit'>,
        res: ExpressResponse<'/products/review/edit', 'post'>,
    ) => {
        const { body } = req;

        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const { product_id: bodyProductId, rating: bodyRating, comment } = body;
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

        try {
            const success = await updateReview(
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
        } catch (error) {
            console.error('Error editing review:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    },
);

export default productReviewsRouter;
