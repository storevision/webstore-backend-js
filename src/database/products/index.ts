import getClient from 'database/db';
// @ts-expect-error: Typescript is deppat.
import Fuse from 'fuse.js';

import type { components } from '@/generated/schema';

export type ProductsWithWidthAndHeight = components['schemas']['Product'];

export const listProducts = async (): Promise<ProductsWithWidthAndHeight[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query(
            `
                SELECT products.*,
                       inventory.quantity                          AS stock,
                       COALESCE(product_ratings.average_rating, 0) AS avg_rating
                FROM products
                         JOIN inventory ON products.id = inventory.product_id
                         LEFT JOIN product_ratings ON products.id = product_ratings.product_id;`,
        );

        if (rows.length === 0) {
            return [];
        }

        // check if any of the rows are missing image_width or image_height
        const missingDimensions = rows.filter(
            row => row.image_width === null || row.image_height === null,
        );

        if (missingDimensions.length > 0) {
            console.log('Missing dimensions:', missingDimensions);
            return [];
        }

        return rows.map(row => ({
            ...row,
            price_per_unit: parseFloat(row.price_per_unit),
        }));
    } finally {
        client.release();
    }
};

export const getProduct = async (
    id: number,
): Promise<components['schemas']['Product'] | null> => {
    const client = await getClient();

    try {
        const { rows } = await client.query(
            `
            SELECT products.*,
                   inventory.quantity                          AS stock,
                   COALESCE(product_ratings.average_rating, 0) AS avg_rating
            FROM products
                     JOIN inventory ON products.id = inventory.product_id
                     LEFT JOIN product_ratings ON products.id = product_ratings.product_id
            WHERE products.id = $1;`,
            [id],
        );

        if (rows.length === 0) {
            return null;
        }

        return {
            ...rows[0],
            price_per_unit: parseFloat(rows[0].price_per_unit),
        };
    } finally {
        client.release();
    }
};

export interface SearchedProducts {
    product: ProductsWithWidthAndHeight;
    score: number;
}

export const searchProducts = async (
    query: string,
    products: ProductsWithWidthAndHeight[],
): Promise<SearchedProducts[]> => {
    const client = await getClient();

    try {
        const fuseInstance = new Fuse<ProductsWithWidthAndHeight>(products, {
            keys: ['name', 'description'],
            includeScore: true,
            threshold: 0.35,
            shouldSort: true,
        });

        const results = fuseInstance.search(query);

        return results.map(
            result =>
                ({
                    product: {
                        ...result.item,
                        price_per_unit: parseFloat(
                            result.item.price_per_unit as unknown as string,
                        ),
                    },
                    score: result.score,
                }) as SearchedProducts,
        );
    } finally {
        client.release();
    }
};
