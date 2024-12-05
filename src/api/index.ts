import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';

import categoriesRouter from '@/api/categories';
import productsRouter from '@/api/products';
import usersRouter from '@/api/users';

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
app.use(cookieParser());

app.use('/assets', express.static('assets'));
app.get('/healthz', (_req, res) => {
    res.sendStatus(200);
});

app.use(morgan('dev'));

app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/users', usersRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(((err, req, res, _next) => {
    res.status(err.status).json(err);
}) as express.ErrorRequestHandler);

export default app;
