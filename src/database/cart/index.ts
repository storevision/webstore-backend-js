import getClient from '@/database/db';
import type { components } from '@/generated/schema';
import type CartItems from '@/schemas/public/CartItems';
import type { ProductsId } from '@/schemas/public/Products';
import type { UsersId } from '@/schemas/public/Users';

export const addProductToCart = async (
    userId: UsersId,
    productId: ProductsId,
    quantity: number,
): Promise<CartItems[] | false> => {
    const client = await getClient();

    try {
        await client.query('BEGIN');
        const result = await client.query<CartItems>(
            `
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, product_id)
                    DO UPDATE SET quantity = cart_items.quantity + $3
                RETURNING *
            `,
            [userId, productId, quantity],
        );
        await client.query('COMMIT');
        return result.rows;
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
): Promise<CartItems[] | false> => {
    const client = await getClient();

    try {
        await client.query('BEGIN');
        await client.query(
            `
                UPDATE cart_items
                SET quantity = GREATEST(cart_items.quantity - $3, 0)
                WHERE user_id = $1 AND product_id = $2
                RETURNING *
            `,
            [userId, productId, quantity],
        );

        // delete row if quantity is 0
        const result = await client.query<CartItems>(
            `
                DELETE FROM cart_items
                WHERE user_id = $1 AND product_id = $2 AND quantity = 0
                RETURNING *
            `,
            [userId, productId],
        );

        await client.query('COMMIT');
        return result.rows;
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

export type ExtendedCartItems = CartItems & {
    product: components['schemas']['Product'];
};

type ExtendedCartItemsRow = CartItems & components['schemas']['Product'];

export const extendedListCart = async (
    userId: UsersId,
): Promise<ExtendedCartItems[]> => {
    const client = await getClient();
    const { rows } = await client.query<ExtendedCartItemsRow>(
        `
            SELECT
                cart_items.*,
                products.*,
                inventory.quantity                          AS stock,
                COALESCE(product_ratings.average_rating, 0) AS average_rating,
                COALESCE(product_ratings.one_star, 0)       AS one_star,
                COALESCE(product_ratings.two_stars, 0)      AS two_stars,
                COALESCE(product_ratings.three_stars, 0)    AS three_stars,
                COALESCE(product_ratings.four_stars, 0)     AS four_stars,
                COALESCE(product_ratings.five_stars, 0)     AS five_stars,
                COALESCE(product_ratings.total_reviews, 0)  AS total_reviews
            FROM cart_items
            JOIN products ON cart_items.product_id = products.id
            JOIN inventory ON products.id = inventory.product_id
            LEFT JOIN product_ratings ON products.id = product_ratings.product_id
            WHERE user_id = $1
        `,
        [userId],
    );
    client.release();
    return rows.map(({ user_id, product_id, quantity, ...product }) => ({
        user_id,
        product_id,
        quantity,
        product,
    }));
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
