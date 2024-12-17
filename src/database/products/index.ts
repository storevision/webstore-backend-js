import getClient from 'database/db';
// @ts-expect-error: Typescript is deppat.
import Fuse from 'fuse.js';

import type { AsDatabaseResponse } from '@/database';
import type { CategoriesId } from '@/schemas/public/Categories';
import type Inventory from '@/schemas/public/Inventory';
import type ProductRatings from '@/schemas/public/ProductRatings';
import type { ProductsId } from '@/schemas/public/Products';
import type Products from '@/schemas/public/Products';
import type { RemoveNull } from '@/types';

export type ProductsWithQuantityAndRating = Products &
    Omit<ProductRatings, 'product_id'> & {
        stock: Inventory['quantity'];
    };

export type WithDefinedProperties = ProductsWithQuantityAndRating & {
    image_width: number;
    image_height: number;
} & RemoveNull<Omit<ProductRatings, 'product_id'>>;

export const listProducts = async (): Promise<WithDefinedProperties[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<
            AsDatabaseResponse<ProductsWithQuantityAndRating>
        >(
            `
                SELECT
                    products.*,
                    inventory.quantity                          AS stock,
                    COALESCE(product_ratings.average_rating, 0) AS average_rating,
                    COALESCE(product_ratings.one_star, 0)       AS one_star,
                    COALESCE(product_ratings.two_stars, 0)      AS two_stars,
                    COALESCE(product_ratings.three_stars, 0)    AS three_stars,
                    COALESCE(product_ratings.four_stars, 0)     AS four_stars,
                    COALESCE(product_ratings.five_stars, 0)     AS five_stars,
                    COALESCE(product_ratings.total_reviews, 0)  AS total_reviews
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
            id: parseInt(row.id as unknown as string, 10) as ProductsId,
            category_id: parseInt(
                row.category_id as unknown as string,
                10,
            ) as CategoriesId,
            image_width: parseInt(row.image_width as unknown as string, 10),
            image_height: parseInt(row.image_height as unknown as string, 10),
            stock: parseInt(row.stock as unknown as string, 10),
            one_star: parseInt(row.one_star as unknown as string, 10),
            two_stars: parseInt(row.two_stars as unknown as string, 10),
            three_stars: parseInt(row.three_stars as unknown as string, 10),
            four_stars: parseInt(row.four_stars as unknown as string, 10),
            five_stars: parseInt(row.five_stars as unknown as string, 10),
            total_reviews: parseInt(row.total_reviews as unknown as string, 10),
            average_rating: parseFloat(row.average_rating as unknown as string),
        }));
    } finally {
        client.release();
    }
};

export const getProduct = async (
    id: ProductsId,
): Promise<WithDefinedProperties | null> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<
            AsDatabaseResponse<ProductsWithQuantityAndRating>
        >(
            `
            SELECT
                products.*,
                inventory.quantity                          AS stock,
                COALESCE(product_ratings.average_rating, 0) AS average_rating,
                COALESCE(product_ratings.one_star, 0)       AS one_star,
                COALESCE(product_ratings.two_stars, 0)      AS two_stars,
                COALESCE(product_ratings.three_stars, 0)    AS three_stars,
                COALESCE(product_ratings.four_stars, 0)     AS four_stars,
                COALESCE(product_ratings.five_stars, 0)     AS five_stars,
                COALESCE(product_ratings.total_reviews, 0)  AS total_reviews
            FROM products
            JOIN inventory ON products.id = inventory.product_id
            LEFT JOIN product_ratings ON products.id = product_ratings.product_id
            WHERE products.id = $1;
            `,
            [id],
        );

        if (rows.length === 0) {
            return null;
        }

        return {
            ...rows[0],
            price_per_unit: parseFloat(rows[0].price_per_unit),
            id: parseInt(rows[0].id as unknown as string, 10) as ProductsId,
            category_id: parseInt(
                rows[0].category_id as unknown as string,
                10,
            ) as CategoriesId,
            image_width: parseInt(rows[0].image_width as unknown as string, 10),
            image_height: parseInt(
                rows[0].image_height as unknown as string,
                10,
            ),
            stock: parseInt(rows[0].stock as unknown as string, 10),
            one_star: parseInt(rows[0].one_star as unknown as string, 10),
            two_stars: parseInt(rows[0].two_stars as unknown as string, 10),
            three_stars: parseInt(rows[0].three_stars as unknown as string, 10),
            four_stars: parseInt(rows[0].four_stars as unknown as string, 10),
            five_stars: parseInt(rows[0].five_stars as unknown as string, 10),
            total_reviews: parseInt(
                rows[0].total_reviews as unknown as string,
                10,
            ),
            average_rating: parseFloat(
                rows[0].average_rating as unknown as string,
            ),
        };
    } finally {
        client.release();
    }
};

export interface SearchedProducts {
    product: WithDefinedProperties;
    score: number;
}

export const searchProducts = async (
    query: string,
    products: WithDefinedProperties[],
): Promise<SearchedProducts[]> => {
    const client = await getClient();

    try {
        const fuseInstance = new Fuse<WithDefinedProperties>(products, {
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
