import type express from 'express';
import jwt from 'jsonwebtoken';

import { verifyUserByObject } from '@/database/users';
import type Users from '@/schemas/public/Users';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

export interface TokenUsers
    extends Pick<Users, 'id' | 'email' | 'display_name'> {
    iat: number;
    exp: number;
}

export const verifyRequest = async (
    req: express.Request,
    res: express.Response,
): Promise<TokenUsers | null> => {
    const { token } = req.cookies;

    if (!token) {
        console.log('no token');
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return null;
    }

    try {
        const user = jwt.verify(token, JWT_SECRET) as TokenUsers;

        const verified = await verifyUserByObject(user);

        if (!verified) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return null;
        }

        return user;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ success: false, message: 'Token expired' });
            return null;
        }

        res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    return null;
};

const inDays = (n: number): number => n * 24 * 60 * 60 * 1000 + Date.now();

export const setCookie = (
    res: express.Response,
    user: Users,
    keepLoggedIn: boolean = false,
): void => {
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
        } as TokenUsers,
        JWT_SECRET,
        {
            expiresIn: keepLoggedIn ? '30d' : '1d',
        },
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        // if keepLoggedIn is true, set the cookie to expire in 30 days.
        // otherwise, let cookie last only for session
        expires: keepLoggedIn ? new Date(inDays(30)) : undefined,
    });
};

export const clearCookie = (res: express.Response): void => {
    res.clearCookie('token');
};

export default { verifyRequest, setCookie, clearCookie };
