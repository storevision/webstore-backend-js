import cookieParser from 'cookie-parser';
import express from 'express';
import type * as core from 'express-serve-static-core';
import morgan from 'morgan';
import type { PathsWithMethod } from 'openapi-typescript-helpers';

import cartRouter from '@/api/cart';
import categoriesRouter from '@/api/categories';
import ordersRouter from '@/api/orders';
import productsRouter from '@/api/products';
import usersRouter from '@/api/users';
import type { paths } from '@/generated/schema';

export type Method =
    | 'get'
    | 'put'
    | 'post'
    | 'delete'
    | 'options'
    | 'head'
    | 'patch'
    | 'trace';

export type ExtractSuccessData<T> = T extends { success: true; data: infer D }
    ? D
    : never;

export type SuccessData<
    P extends keyof paths,
    M extends keyof paths[P],
> = paths[P][M] extends {
    responses: {
        200: {
            content: { 'application/json': { success: true; data: infer T } };
        };
    };
}
    ? T
    : null;

export interface SuccessResponse<
    P extends keyof paths,
    M extends keyof paths[P],
> {
    success: true;
    data: SuccessData<P, M>;
}

export interface ErrorResponse {
    success: false;
    error: string;
}

export type ApiResponse<P extends keyof paths, M extends keyof paths[P]> =
    | SuccessResponse<P, M>
    | ErrorResponse;

export type ExpressResponse<
    P extends keyof paths,
    M extends keyof paths[P],
> = express.Response<ApiResponse<P, M>>;

export type RequestBody<
    P extends PathsWithMethod<paths, M>,
    M extends Method = 'post',
> = paths[P][M] extends {
    requestBody: { content: { 'application/json': object } };
}
    ? paths[P][M]['requestBody']['content']['application/json']
    : never;

export type ExpressRequest<
    P extends PathsWithMethod<paths, M>,
    M extends Method = 'post',
> = express.Request<core.ParamsDictionary, unknown, Partial<RequestBody<P, M>>>;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/assets', express.static('assets'));
app.get('/healthz', (_req, res) => {
    res.sendStatus(200);
});

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);
app.use('/cart', cartRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(((err, req, res, _next) => {
    res.status(err.status).json(err);
}) as express.ErrorRequestHandler);

export default app;
