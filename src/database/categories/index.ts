import getClient from 'database/db';
import type Categories from 'schemas/public/Categories';
import type { CategoriesId } from 'schemas/public/Categories';

import type { AsDatabaseResponse } from '@/database';

export const listCategories = async (): Promise<Categories[]> => {
    const client = await getClient();

    try {
        const { rows } = await client.query<AsDatabaseResponse<Categories>>(
            'SELECT * FROM categories',
        );

        return rows.map(row => ({
            ...row,
            id: parseInt(row.id as unknown as string, 10) as CategoriesId,
        }));
    } finally {
        client.release();
    }
};
