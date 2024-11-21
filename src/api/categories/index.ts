import type { ExpressResponse } from 'api';
import express from 'express';

import { listCategories } from '@/database/categories';
import type Categories from '@/schemas/public/Categories';

const categoriesRouter = express.Router();

categoriesRouter.get(
    '/list',
    async (_req, res: ExpressResponse<Categories[]>) => {
        const categories = await listCategories();
        res.json({ success: true, data: categories });
    },
);

export default categoriesRouter;
