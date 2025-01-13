import type { ExpressResponse, SuccessData } from 'api';
import express from 'express';

import { verifyRequest } from '@/api/cookies';
import { getOrderById, getOrderItems, listOrders } from '@/database/orders';
import { listAddresses } from '@/database/users';
import type { OrdersId } from '@/schemas/public/Orders';

const ordersRouter = express.Router();

type MappedOrder = SuccessData<'/orders/list', 'get'>[0];

ordersRouter.get(
    '/list',
    async (req, res: ExpressResponse<'/orders/list', 'get'>) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const orders = await listOrders(user?.id);

        const addresses = await listAddresses(user?.id);

        try {
            const mappedOrders = await Promise.all(
                orders.map(async order => {
                    const address = addresses.find(
                        a => a.id === order.address_id,
                    );

                    if (!address) {
                        throw new Error('Address not found');
                    }

                    const items = await getOrderItems(order.id);

                    return {
                        id: order.id,
                        created_at: order.created_at.toISOString(),
                        address,
                        items,
                    } as MappedOrder;
                }),
            );

            res.json({ success: true, data: mappedOrders });
        } catch (e) {
            res.status(500).json({
                success: false,
                error: 'An error occurred while fetching orders',
            });
        }
    },
);

ordersRouter.post(
    '/get',
    async (req, res: ExpressResponse<'/orders/get', 'get'>) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const { id } = req.body;

        if (!id) {
            res.status(400).json({
                success: false,
                error: 'No ID provided',
            });
            return;
        }

        const orderId = parseInt(id, 10) as OrdersId;

        if (Number.isNaN(orderId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID',
            });
            return;
        }

        const orders = await getOrderById(orderId, user.id);

        if (!orders) {
            res.status(404).json({
                success: false,
                error: 'Order not found',
            });
            return;
        }

        const addresses = await listAddresses(user.id);

        const address = addresses.find(a => a.id === orders.address_id);

        if (!address) {
            res.status(404).json({
                success: false,
                error: 'Address not found',
            });
            return;
        }

        const items = await getOrderItems(orders.id);

        res.json({
            success: true,
            data: {
                id: orders.id,
                created_at: orders.created_at.toISOString(),
                address,
                items,
            },
        });
    },
);

export default ordersRouter;
