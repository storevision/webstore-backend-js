import getClient from 'database/db';
import type Orders from 'schemas/public/Orders';
import type { OrdersId } from 'schemas/public/Orders';

import type { AsDatabaseResponse } from '@/database';
import type OrderItems from '@/schemas/public/OrderItems';
import type { ProductsId } from '@/schemas/public/Products';
import type { UserAddressesId } from '@/schemas/public/UserAddresses';
import type { UsersId } from '@/schemas/public/Users';

export const listOrders = async (userId: UsersId): Promise<Orders[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<AsDatabaseResponse<Orders>>(
            'SELECT * FROM orders WHERE user_id = $1',
            [userId],
        );

        return rows.map(row => ({
            ...row,
            id: parseInt(row.id as unknown as string, 10) as OrdersId,
            user_id: parseInt(row.user_id as unknown as string, 10) as UsersId,
            address_id: parseInt(
                row.address_id as unknown as string,
                10,
            ) as UserAddressesId,
            created_at: new Date(row.created_at),
        }));
    } finally {
        client.release();
    }
};

export const getOrderItems = async (
    orderId: OrdersId,
): Promise<OrderItems[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<AsDatabaseResponse<OrderItems>>(
            'SELECT * FROM order_items WHERE order_id = $1',
            [orderId],
        );

        return rows.map(row => ({
            ...row,
            order_id: parseInt(
                row.order_id as unknown as string,
                10,
            ) as OrdersId,
            product_id: parseInt(
                row.product_id as unknown as string,
                10,
            ) as ProductsId,
            quantity: parseInt(row.quantity as unknown as string, 10),
            price_per_unit: parseFloat(row.price_per_unit as unknown as string),
        }));
    } finally {
        client.release();
    }
};

export const getOrderById = async (
    id: OrdersId,
    userId: UsersId,
): Promise<Orders | null> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<AsDatabaseResponse<Orders>>(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [id, userId],
        );

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];

        return {
            ...row,
            id: parseInt(row.id as unknown as string, 10) as OrdersId,
            user_id: parseInt(row.user_id as unknown as string, 10) as UsersId,
            address_id: parseInt(
                row.address_id as unknown as string,
                10,
            ) as UserAddressesId,
            created_at: new Date(row.created_at),
        };
    } finally {
        client.release();
    }
};
