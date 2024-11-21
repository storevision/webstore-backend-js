import express from 'express';

import categoriesRouter from '@/api/categories';
import productsRouter from '@/api/products';

export interface SuccessResponse<T> {
    success: true;
    data: T;
}

export interface ErrorResponse {
    success: false;
    error: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type ExpressResponse<T> = express.Response<ApiResponse<T>>;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);

app.use('/assets', express.static('assets'));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(((err, req, res, _next) => {
    res.status(err.status).json(err);
}) as express.ErrorRequestHandler);

export default app;
