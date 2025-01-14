import type { ExpressRequest, ExpressResponse } from 'api';
import express from 'express';

import { verifyRequest } from '@/api/cookies';
import {
    addProductToCart,
    cartCheckout,
    clearCart,
    extendedListCart,
    removeProductFromCart,
} from '@/database/cart';
import { verifyProductId } from '@/database/products';

const cartRouter = express.Router();

cartRouter.post(
    '/add',
    async (
        req: ExpressRequest<'/cart/add'>,
        res: ExpressResponse<'/cart/add', 'post'>,
    ) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const { product_id: productId, quantity } = req.body;

        if (typeof productId !== 'number') {
            res.json({ success: false, error: 'Invalid product ID' });
            return;
        }

        if (!quantity) {
            res.json({ success: false, error: 'Invalid quantity' });
            return;
        }

        const validProductId = await verifyProductId(productId);

        if (validProductId === null) {
            res.json({ success: false, error: 'Invalid product ID' });
            return;
        }

        const isAdded = await addProductToCart(
            user.id,
            validProductId,
            quantity,
        );

        if (isAdded) {
            res.json({ success: true, data: isAdded });
        } else {
            res.json({ success: false, error: 'An error occurred' });
        }
    },
);

cartRouter.post(
    '/remove',
    async (
        req: ExpressRequest<'/cart/remove'>,
        res: ExpressResponse<'/cart/remove', 'post'>,
    ) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const { product_id: productId, quantity } = req.body;

        if (typeof productId !== 'number') {
            res.json({ success: false, error: 'Invalid product ID' });
            return;
        }

        if (!quantity) {
            res.json({ success: false, error: 'Invalid quantity' });
            return;
        }

        const validProductId = await verifyProductId(productId);

        if (validProductId === null) {
            res.json({ success: false, error: 'Invalid product ID' });
            return;
        }

        const isRemoved = await removeProductFromCart(
            user.id,
            validProductId,
            quantity,
        );

        if (isRemoved) {
            res.json({ success: true, data: isRemoved });
        } else {
            res.json({ success: false, error: 'An error occurred' });
        }
    },
);

cartRouter.get(
    '/list',
    async (req, res: ExpressResponse<'/cart/list', 'get'>) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        try {
            const cartItems = await extendedListCart(user.id);

            res.json({ success: true, data: cartItems });
        } catch (error) {
            console.error(error);
            res.json({ success: false, error: 'An error occurred' });
        }
    },
);

cartRouter.post(
    '/checkout',
    async (
        req: ExpressRequest<'/cart/checkout'>,
        res: ExpressResponse<'/cart/checkout', 'post'>,
    ) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const { address } = req.body;

        if (!address) {
            res.json({ success: false, error: 'No address provided' });
            return;
        }

        // noinspection SuspiciousTypeOfGuard
        if (
            typeof address !== 'object' ||
            typeof address.address !== 'string' ||
            typeof address.city !== 'string' ||
            typeof address.state !== 'string' ||
            typeof address.postal_code !== 'string' ||
            typeof address.name !== 'string' ||
            typeof address.country !== 'string'
        ) {
            res.json({ success: false, error: 'Invalid address' });
            return;
        }

        const result = await cartCheckout(user.id, address);

        if (result) {
            res.json({ success: true, data: null });
        } else {
            res.json({ success: false, error: 'An error occurred' });
        }
    },
);

cartRouter.post(
    '/clear',
    async (req, res: ExpressResponse<'/cart/clear', 'post'>) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const result = await clearCart(user.id);

        if (result) {
            res.json({ success: true, data: null });
        } else {
            res.json({ success: false, error: 'An error occurred' });
        }
    },
);

export default cartRouter;
