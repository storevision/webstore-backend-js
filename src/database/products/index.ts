import getClient from 'database/db';
// @ts-expect-error: Typescript is deppat.
import Fuse from 'fuse.js';
import type Products from 'schemas/public/Products';

export const listProducts = async (): Promise<Products[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query('SELECT * FROM products');

        return rows.map(row => ({
            ...row,
            price_per_unit: parseFloat(row.price_per_unit),
        }));
    } finally {
        client.release();
    }
};

export interface SearchedProducts {
    product: Products;
    score: number;
}

export const searchProducts = async (
    query: string,
): Promise<SearchedProducts[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query('SELECT * FROM products');

        const fuseInstance = new Fuse<Products>(rows, {
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
