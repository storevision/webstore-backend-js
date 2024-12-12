import type { ExpressResponse } from 'api';
import express from 'express';

import { listCategories } from '@/database/categories';

const categoriesRouter = express.Router();

categoriesRouter.get(
    '/list',
    async (_req, res: ExpressResponse<'/categories/list', 'get'>) => {
        const categories = await listCategories();
        res.json({ success: true, data: categories });
    },
);

export default categoriesRouter;
