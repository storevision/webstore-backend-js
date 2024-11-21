import getClient from 'database/db';
import type Categories from 'schemas/public/Categories';

export const listCategories = async (): Promise<Categories[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query('SELECT * FROM categories');

        return rows;
    } finally {
        client.release();
    }
};
