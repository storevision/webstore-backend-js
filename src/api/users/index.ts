import type { ExpressResponse } from 'api';
import express from 'express';
import type Users from 'schemas/public/Users';

import type { TokenUsers } from '@/api/cookies';
import { clearCookie, setCookie, verifyRequest } from '@/api/cookies';
import {
    registerUser,
    UserAlreadyExistsError,
    verifyUser,
} from '@/database/users';

const usersRouter = express.Router();

usersRouter.post('/register', async (req, res: ExpressResponse<Users>) => {
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
});

usersRouter.post('/login', async (req, res: ExpressResponse<Users>) => {
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
});

usersRouter.post('/logout', async (_req, res: ExpressResponse<null>) => {
    clearCookie(res);
    res.json({ success: true, data: null });
});

usersRouter.get(
    '/info',
    async (req, res: ExpressResponse<TokenUsers | null>) => {
        const user = await verifyRequest(req, res);

        if (!user) {
            return;
        }

        res.json({ success: true, data: user });
    },
);

export default usersRouter;
