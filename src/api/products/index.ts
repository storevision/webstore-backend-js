import type { ExpressResponse } from 'api';
import { listProducts } from 'database/products';
import express from 'express';
import type Products from 'schemas/public/Products';

const productsRouter = express.Router();

productsRouter.get('/list', async (_req, res: ExpressResponse<Products[]>) => {
    const products = await listProducts();
    res.json({ success: true, data: products });
});

export default productsRouter;
