import getClient from 'database/db';

import type { AsDatabaseResponse } from '@/database';
import type { components } from '@/generated/schema';
import type { ProductsId } from '@/schemas/public/Products';

export type Review = components['schemas']['DatabaseCustomerReview'];

export const getReviews = async (productId: ProductsId): Promise<Review[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<AsDatabaseResponse<Review>>(
            `
            SELECT
                reviews.*,
                users.display_name AS user_display_name
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
        }));
    } finally {
        client.release();
    }
};
