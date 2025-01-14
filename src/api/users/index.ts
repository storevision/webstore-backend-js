import type { ExpressResponse } from 'api';
import express from 'express';

import { clearCookie, setCookie, verifyRequest } from '@/api/cookies';
import {
    listAddresses,
    registerUser,
    setAddresses,
    UserAlreadyExistsError,
    verifyUser,
} from '@/database/users';

const usersRouter = express.Router();

usersRouter.post(
    '/register',
    async (req, res: ExpressResponse<'/users/register', 'post'>) => {
        const { displayName, email, password } = req.body;

        if (!displayName || !email || !password) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
            return;
        }

        try {
            const user = await registerUser({ displayName, email, password });

            setCookie(req, res, user, false);

            // console.log('Registered user:', user);

            res.json({ success: true, data: user });
        } catch (error) {
            if (error instanceof UserAlreadyExistsError) {
                res.status(409).json({
                    success: false,
                    error: 'User already exists',
                });
                return;
            }

            console.error('Error registering user:', error);

            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    },
);

usersRouter.post(
    '/login',
    async (req, res: ExpressResponse<'/users/login', 'post'>) => {
        const { email, password, keepLoggedIn } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
            return;
        }

        const user = await verifyUser(email, password);

        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password.',
            });
            return;
        }

        setCookie(req, res, user, keepLoggedIn);

        res.json({ success: true, data: user });
    },
);

usersRouter.post(
    '/logout',
    async (_req, res: ExpressResponse<'/users/logout', 'post'>) => {
        clearCookie(res);
        res.json({ success: true, data: null });
    },
);

usersRouter.get(
    '/info',
    async (req, res: ExpressResponse<'/users/info', 'get'>) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        res.json({ success: true, data: user });
    },
);

usersRouter.get(
    '/settings',
    async (req, res: ExpressResponse<'/users/settings', 'get'>) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const addresses = await listAddresses(user.id);

        res.json({
            success: true,
            data: {
                addresses,
            },
        });
    },
);

usersRouter.post(
    '/settings',
    async (req, res: ExpressResponse<'/users/settings', 'post'>) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        const { addresses } = req.body;

        if (!Array.isArray(addresses)) {
            res.status(400).json({
                success: false,
                error: 'Invalid request',
            });
            return;
        }

        // check that all addresses are valid
        for (const address of addresses) {
            if (
                typeof address !== 'object' ||
                typeof address.name !== 'string' ||
                typeof address.address !== 'string' ||
                typeof address.city !== 'string' ||
                typeof address.state !== 'string' ||
                typeof address.postal_code !== 'string' ||
                typeof address.country !== 'string'
            ) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid address',
                });
                return;
            }
        }

        const addressResult = await setAddresses(user.id, addresses);

        if (!addressResult) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
            return;
        }

        res.json({ success: true, data: null });
    },
);

export default usersRouter;
