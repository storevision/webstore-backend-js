import getClient from 'database/db';
import type Products from 'schemas/public/Products';

export const listProducts = async (): Promise<Products[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query('SELECT * FROM products');

        return rows;
    } finally {
        client.release();
    }
};
