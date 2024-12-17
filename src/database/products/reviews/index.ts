import getClient from 'database/db';
import type { DatabaseError } from 'pg';

import type { AsDatabaseResponse } from '@/database';
import type { components } from '@/generated/schema';
import type { ProductsId } from '@/schemas/public/Products';
import type { UsersId } from '@/schemas/public/Users';

export type Review = components['schemas']['DatabaseCustomerReview'];

export class ReviewAlreadyExistsError extends Error {
    constructor() {
        super('Review already exists');
        this.name = 'ReviewAlreadyExistsError';
    }
}

export const getReviews = async (
    productId: ProductsId,
    userId?: UsersId,
): Promise<Review[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<AsDatabaseResponse<Review>>(
            `
            SELECT
                reviews.*,
                users.display_name AS user_display_name,
                users.picture_data_url AS user_picture_data_url
            FROM reviews
            JOIN users ON reviews.user_id = users.id
            WHERE product_id = $1;
            `,
            [productId],
        );

        if (rows.length === 0) {
            return [];
        }

        return rows.map(row => ({
            ...row,
            rating: parseFloat(row.rating as unknown as string),
            id: parseInt(row.id as unknown as string, 10),
            product_id: parseInt(row.product_id as unknown as string, 10),
            user_id: parseInt(row.user_id as unknown as string, 10),
            is_from_logged_in_user:
                parseInt(row.user_id as unknown as string, 10) === userId,
        }));
    } finally {
        client.release();
    }
};

export const addReview = async (
    productId: ProductsId,
    userId: UsersId,
    rating: number,
    comment: string | null,
): Promise<boolean> => {
    const client = await getClient();

    try {
        await client.query(
            `
            INSERT INTO reviews (product_id, user_id, rating, comment)
            VALUES ($1, $2, $3, $4);
            `,
            [productId, userId, rating, comment],
        );

        return true;
    } catch (error) {
        if ((error as DatabaseError).code === '23505') {
            // unique_violation
            throw new ReviewAlreadyExistsError();
        }

        throw error;
    } finally {
        client.release();
    }
};

export const deleteReview = async (
    productId: ProductsId,
    userId: UsersId,
): Promise<boolean> => {
    const client = await getClient();

    try {
        const { rowCount } = await client.query(
            `
            DELETE FROM reviews
            WHERE product_id = $1 AND user_id = $2;
            `,
            [productId, userId],
        );

        return rowCount === 1;
    } finally {
        client.release();
    }
};

export const updateReview = async (
    productId: ProductsId,
    userId: UsersId,
    rating: number,
    comment: string | null,
): Promise<boolean> => {
    const client = await getClient();

    try {
        const { rowCount } = await client.query(
            `
            UPDATE reviews
            SET rating = $3, comment = $4
            WHERE product_id = $1 AND user_id = $2;
            `,
            [productId, userId, rating, comment],
        );

        return rowCount === 1;
    } finally {
        client.release();
    }
};
