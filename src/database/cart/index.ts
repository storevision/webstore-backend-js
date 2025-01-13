import getClient from '@/database/db';
import type CartItems from '@/schemas/public/CartItems';
import type { ProductsId } from '@/schemas/public/Products';
import type { UsersId } from '@/schemas/public/Users';

export const addProductToCart = async (
    userId: UsersId,
    productId: ProductsId,
    quantity: number,
): Promise<boolean> => {
    const client = await getClient();

    try {
        await client.query('BEGIN');
        await client.query(
            `
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, product_id)
                    DO UPDATE SET quantity = cart_items.quantity + $3
            `,
            [userId, productId, quantity],
        );
        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const removeProductFromCart = async (
    userId: UsersId,
    productId: ProductsId,
    quantity: number,
): Promise<boolean> => {
    const client = await getClient();

    try {
        await client.query('BEGIN');
        await client.query(
            `
                UPDATE cart_items
                SET quantity = GREATEST(cart_items.quantity - $3, 0)
                WHERE user_id = $1 AND product_id = $2
            `,
            [userId, productId, quantity],
        );
        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const listCart = async (userId: UsersId): Promise<CartItems[]> => {
    const client = await getClient();
    const { rows } = await client.query<CartItems>(
        `
            SELECT *
            FROM cart_items
            WHERE user_id = $1
        `,
        [userId],
    );
    client.release();
    return rows;
};

export const clearCart = async (userId: UsersId): Promise<boolean> => {
    const client = await getClient();

    try {
        await client.query('BEGIN');
        await client.query(
            `
                DELETE FROM cart_items
                WHERE user_id = $1
            `,
            [userId],
        );
        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
